import os
import sys
import pandas as pd
import random
from datetime import datetime
from pathlib import Path
from sqlalchemy import create_engine, text

# --- 1. 환경 설정 ---
current_path = Path(__file__).resolve()
project_root = current_path.parent.parent.parent 
if str(project_root) not in sys.path:
    sys.path.append(str(project_root))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings') 
import django
django.setup()

from django.conf import settings

def migrate_to_kosmo_tables():
    """CSV 데이터를 기반으로 kosmo DB 스키마 마이그레이션 실행"""
    logs_dir = Path(settings.BASE_DIR).parent / "logs"
    db_url = "mysql+pymysql://kosmo:1234@127.0.0.1:3306/kosmo?charset=utf8mb4"
    engine = create_engine(db_url, pool_pre_ping=True)

    try:
        # 파일 존재 여부 일괄 확인
        files = {
            "prod": logs_dir / "product_master.csv",
            "cat": logs_dir / "category_master.csv",
            "pet": logs_dir / "pet_master.csv",
            "order": logs_dir / "purchase_history.csv"
        }
        
        for f in files.values():
            if not f.exists():
                print(f"❌ {f.name} 파일 누락. generator를 먼저 실행하세요.")
                return

        print("📊 마이그레이션 프로세스 시작...")

        with engine.begin() as conn:
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
            
            # 1. 기존 데이터 정리
            for table in ["et_order_item", "et_order", "et_pet", "et_product_sku", "et_product", "et_category"]:
                conn.execute(text(f"TRUNCATE TABLE {table};"))
            
            # 2. 카테고리 및 상품 삽입
            pd.read_csv(files["cat"]).to_sql('et_category', conn, if_exists='append', index=False)
            
            df_prod = pd.read_csv(files["prod"])
            cols = ['product_id', 'category_id', 'product_code', 'name', 'status', 'base_price', 'description']
            df_prod[[c for c in cols if c in df_prod.columns]].to_sql('et_product', conn, if_exists='append', index=False)
            
            # 3. SKU 일괄 생성
            conn.execute(text("""
                INSERT INTO et_product_sku (product_id, sku_code, price, stock, status)
                SELECT product_id, CONCAT('SKU-', product_code), base_price, 999, 'ON_SALE' FROM et_product
            """))

            # 4. 펫 프로필 삽입
            pd.read_csv(files["pet"]).to_sql('et_pet', conn, if_exists='append', index=False)

            # 5. 주문 이력 생성 (유저별 그룹화 처리)
            df_order_raw = pd.read_csv(files["order"])
            sku_info = {r.product_id: (r.sku_id, r.price) for r in conn.execute(text("SELECT sku_id, product_id, price FROM et_product_sku")).fetchall()}
            
            unique_users = df_order_raw['user_id'].unique()
            for u_id in unique_users:
                order_code = f"ORD-2026-{u_id}-{random.randint(1000, 9999)}"
                conn.execute(text("INSERT INTO et_order (user_id, order_code, order_status, total_amount, receiver_name) VALUES (:u, :c, 'COMPLETED', 0, :n)"),
                             {"u": int(u_id), "c": order_code, "n": f"사용자{u_id}"})
                
                order_id = conn.execute(text("SELECT LAST_INSERT_ID()")).scalar()
                total_amt = 0
                
                # 주문 상세 항목 대량 삽입 준비
                user_items = df_order_raw[df_order_raw['user_id'] == u_id]
                for _, row in user_items.iterrows():
                    p_id = row['product_id']
                    if p_id in sku_info:
                        s_id, price = sku_info[p_id]
                        total_amt += price
                        conn.execute(text("INSERT INTO et_order_item (order_id, sku_id, price, quantity) VALUES (:o, :s, :p, 1)"),
                                     {"o": order_id, "s": s_id, "p": int(price)})
                
                conn.execute(text("UPDATE et_order SET total_amount = :t WHERE order_id = :o"), {"t": total_amt, "o": order_id})

            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
            
        print("✨ 모든 데이터 마이그레이션이 완료되었습니다.")

    except Exception as e:
        print(f"❌ 오류 발생: {e}")

if __name__ == "__main__":
    migrate_to_kosmo_tables()