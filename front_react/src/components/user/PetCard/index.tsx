import { usePet } from "@/hooks/user/pet/pet.hook";
import { Pet } from "@/types/user/interface";
import './style.css';

interface Props {
  pet: Pet;
}

//컴포넌트 : 펫 정보 조회용 카드 (여러 리스트로 관리가 가능)
export default function PetCard({ pet }: Props) {

    //속성 : 펫 속성 가져오기 
    const {petId,name,species,breed,age,gender,isNeutered,activityLevel,weight} = pet;

    //함수 : 펫 정보에서 쓰일 함수 불러오기
    const {
        onPetUpdateHandler, onPetDeleteHandler  //펫정보 수정 / 삭제      
    } = usePet();

    //함수 : 중성화 수술 y/n 여부 => 완료 미완료 반환 
    function getNeuteredStatus(val: boolean | null): string {
        if (val === true) return "완료";
        if (val === false) return "미완료";
        return "";
    }

    //함수 : 활동성 수치 여부 => 실내 중간 야외로 반환 
    function getActiveStatus(val: number | null): string {
        switch(val) {
            case 1: return "실내"; 
            case 2: return "중간";
            case 3: return "야외"; 
        }
        return "";
    }

    return (
        <div className="pet-card">
        <div className="pet-card-header">
            <div className="pet-name">{name !== null ? `이름 : ${name}` : ""}</div>
            <div className={`pet-gender ${gender === 'M' ? 'M' : 'F'}`}>
            {gender !== null ? `성별 : ${gender}` : ""}
            </div>
        </div>
        <div className="pet-breed-info">
            <span>{species !== null ? `${species} 종` : ""}</span>
            {pet.species && pet.breed && <span className="divider"> / </span>}
            <span>{breed !== null ? `${breed} 품종` : ""}</span>
        </div>
            <div className="pet-details-grid">
                <div className="detail-item">
                    <div className="label">나이</div>
                    <div className="value">{age !== null ? `${age} 살` : ""}</div>
                </div>
                <div className="detail-item">
                    <div className="label">무게</div>
                    <div className="value">{weight !== null ? `${weight}kg` : ""}</div>
                </div>
                <div className="detail-item">
                    <div className="label">중성화</div>
                    <div className="value">{getNeuteredStatus(isNeutered)}</div>
                </div>
                <div className="detail-item">
                    <div className="label">활동성</div>
                    <div className="value">{getActiveStatus(activityLevel)}</div>
                </div>
            </div>

            <div className="pet-card-actions">
                <button className="btn-edit" type="button" onClick={() => onPetUpdateHandler(petId)}>수정</button>
                <button className="btn-delete" type="button" onClick={() =>onPetDeleteHandler(petId)}>삭제</button>
            </div>
        </div>
    );
}