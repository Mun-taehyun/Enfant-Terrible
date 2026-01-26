import os
import sys
import django
import pandas as pd
import random
from sqlalchemy import create_engine, text
from pathlib import Path

# --- Django 환경 초기화 ---
current_path = Path(__file__).resolve()
project_root = current_path.parent.parent.parent 
if str(project_root) not in sys.path:
    sys.path.append(str(project_root))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings') 
django.setup()

from django.conf import settings

def migrate_to_kosmo_tables():
    LOGS_PATH = Path(settings.BASE_DIR).parent / "logs"
    
    # 파일 경로 설정
    PROD_CSV = LOGS_PATH / "product_master.csv"
    CAT_CSV = LOGS_PATH / "category_master.csv"
    PET_CSV = LOGS_PATH / "pet_master.csv"
    ORDER_CSV = LOGS_PATH / "purchase_history.csv" # user_id, product_id가 들어있는 원본 로그

    # DB 접속 정보
    DB_USER = "kosmo"
    DB_PASS = "1234"
    DB_HOST = "127.0.0.1"
    DB_PORT = "3306"
    DB_NAME = "kosmo"

    DB_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    engine = create_engine(DB_URL, pool_pre_ping=True)

    try:
        # 0. 파일 존재 확인
        for f in [PROD_CSV, CAT_CSV, PET_CSV, ORDER_CSV]:
            if not f.exists():
                print(f"❌ {f.name} 파일이 없습니다. generator를 먼저 실행하세요.")
                return

        df_prod = pd.read_csv(PROD_CSV)
        df_cat = pd.read_csv(CAT_CSV)
        df_pet = pd.read_csv(PET_CSV)
        df_order_raw = pd.read_csv(ORDER_CSV)

        print(f"📊 [User: kosmo] 마이그레이션 시작...")

        with engine.begin() as conn:
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
            
            # 1. 기존 데이터 정리 (순서 중요)
            tables = ["et_order_item", "et_order", "et_pet", "et_product_sku", "et_product", "et_category"]
            for table in tables:
                conn.execute(text(f"TRUNCATE TABLE {table};"))
            
            # 2. 카테고리 삽입
            df_cat.to_sql(name='et_category', con=conn, if_exists='append', index=False)
            print("📁 et_category 삽입 완료")
            
            # 3. 상품 삽입 (DB 컬럼에 맞춰 필터링)
            db_prod_cols = ['product_id', 'category_id', 'product_code', 'name', 'status', 'base_price', 'description']
            valid_prod_df = df_prod[[c for c in db_prod_cols if c in df_prod.columns]]
            valid_prod_df.to_sql(name='et_product', con=conn, if_exists='append', index=False)
            print("📦 et_product 삽입 완료")

            # 4. SKU 생성 (et_order_item에서 참조하기 위해 필수)
            # 모든 상품에 대해 기본 SKU를 하나씩 생성합니다.
            conn.execute(text("""
                INSERT INTO et_product_sku (product_id, sku_code, price, stock, status)
                SELECT product_id, CONCAT('SKU-', product_code), base_price, 999, 'ON_SALE'
                FROM et_product
            """))
            print("🔧 et_product_sku 생성 완료")

            # 5. 펫 프로필 삽입
            df_pet.to_sql(name='et_pet', con=conn, if_exists='append', index=False)
            print("🐕 et_pet 삽입 완료")

            # 6. 구매 이력 삽입 (가장 복잡한 부분)
            # (A) product_id -> sku_id 매핑 정보 가져오기
            sku_info = conn.execute(text("SELECT sku_id, product_id, price FROM et_product_sku")).fetchall()
            sku_map = {row.product_id: (row.sku_id, row.price) for row in sku_info}

            # (B) 유저별로 주문(et_order)을 하나 생성하고 그 안에 아이템들을 넣음
            unique_users = df_order_raw['user_id'].unique()
            print(f"🛒 {len(unique_users)}명의 주문 내역 생성 중...")

            for u_id in unique_users:
                user_items = df_order_raw[df_order_raw['user_id'] == u_id]
                order_code = f"ORD-2026-{u_id}-{random.randint(1000, 9999)}"
                
                # et_order 생성 (주문서 본체)
                conn.execute(text("""
                    INSERT INTO et_order (user_id, order_code, order_status, total_amount, receiver_name) 
                    VALUES (:u_id, :code, 'COMPLETED', 0, :name)
                """), {"u_id": int(u_id), "code": order_code, "name": f"사용자{u_id}"})
                
                order_id = conn.execute(text("SELECT LAST_INSERT_ID()")).scalar()
                
                total_order_amount = 0
                # et_order_item 생성 (주문 상세 내역)
                for _, row in user_items.iterrows():
                    p_id = row['product_id']
                    if p_id in sku_map:
                        s_id, price = sku_map[p_id]
                        qty = 1
                        total_order_amount += price * qty
                        
                        conn.execute(text("""
                            INSERT INTO et_order_item (order_id, sku_id, price, quantity) 
                            VALUES (:o_id, :s_id, :price, :qty)
                        """), {"o_id": order_id, "s_id": s_id, "price": int(price), "qty": qty})
                
                # 최종 주문 금액 업데이트
                conn.execute(text("UPDATE et_order SET total_amount = :total WHERE order_id = :o_id"),
                             {"total": total_order_amount, "o_id": order_id})

            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
            
        print(f"✨ [User: kosmo] 모든 데이터가 스키마에 맞춰 마이그레이션 되었습니다!")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    migrate_to_kosmo_tables()