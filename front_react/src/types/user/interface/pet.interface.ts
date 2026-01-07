export default interface Pet {
    petId: number;                                  //펫 정보 기입 시 번호 증가 
    name: string | null;                            //펫 이름 
    species: string | null;                         //펫 종류 
    breed: string | null;                           //펫 품종
    age: number | string | null;                    //펫 나이 
    gender: string | null;                          //펫 성별
    isNeutered: boolean | null;                     //펫 중성화 여부
    activityLevel: number | null;                   //펫 활동성 수치 
    weight: number | null;                          //펫 무게 
}