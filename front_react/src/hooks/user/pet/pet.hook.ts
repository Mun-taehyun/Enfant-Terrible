import { USER_PATH } from "@/constant/user/route.index";
import { userQueries } from "@/querys/user/queryhooks";
import { useState } from "react";
import { useParams } from "react-router-dom";

export const usePet = () => {

    const {petId} = useParams();

    //상태: 펫 초기 데이터 
    const [formData, setFormData] = useState({
        id: 0,
        name: '',
        species: '',
        breed: '',
        age: 0,
        gender: '', 
        isNeutered: null as boolean | null,
        activityLevel: null as number | null,
        weight: 5.0
    });

    //서버상태 : 펫 등록 요청 
    const {mutate : petInsert } = userQueries.usePetAdd();

    //서버상태 : 펫 수정 요청 
    const {mutate : petUpdate } = userQueries.usePetUpdate();

    //서버상태 : 펫 삭제 요청
    const {mutate : petDelete } = userQueries.usePetDelete();

    //이벤트핸들러: 통합 이벤트 처리 
    const updateField = <K extends keyof typeof formData>(
        key: K, 
        value: typeof formData[K] // key에 해당하는 정확한 타입을 강제함
    ) => {setFormData(prev => ({...prev,[key]: value,
            // 종이 변경될 때만 breed를 초기화
            ...(key === 'species' ? { breed: '' } : {})
        }));
    };

    //이벤트핸들러 : 입력값 변화 이벤트 처리 
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateField(name as keyof typeof formData, value);
        //keyof typeof => key에 formData의 모든 타입이 존재 name , species 등...... 을 value로 기입 
    };

    //이벤트핸들러 : 펫 정보 등록 이벤트 처리 
    const onPetRegisterHandler = () => {
        if (!petInsert) return;
        petInsert( //펫등록은 따로 유효처리를 할 필요가 없다. => 값만 잘 들어가면 된다.
            {   
                name: formData.name, species: formData.species , breed: formData.breed,
                age: formData.age, gender: formData.gender , isNeutered: formData.isNeutered,
                activityLevel: formData.activityLevel , weight: formData.weight
            },
            {
                onSuccess: () => {USER_PATH()},
                onError: (error : Error) => { alert(error.message); return; }
            }
        ) 
    };

    //이벤트핸들러 : 펫 정보 수정 이벤트 처리 
    const onPetUpdateHandler = () => {
        if (!petUpdate) return;
        if (!petId) return;
        petUpdate( //펫수정은 따로 유효처리를 할 필요가 없다. 값만 잘 들어가면 된다.
            { //인자가 여러개일 경우 인지.. 
                petId: Number(petId),
                requestBody: 
                {
                    name: formData.name, species: formData.species , breed: formData.breed,
                    age: formData.age, gender: formData.gender , isNeutered: formData.isNeutered,
                    activityLevel: formData.activityLevel , weight: formData.weight
                }
            },
            {
                onSuccess: () => {USER_PATH()},
                onError: (error : Error) => { alert(error.message); return; }
            }
        ) 
    };
    //이벤트핸들러 : 펫 정보 수정 이벤트 처리 
    const onPetDeleteHandler = () => {
        if (!petDelete) return;
        if (!petId) return;
        petDelete( //펫수정은 따로 유효처리를 할 필요가 없다. 값만 잘 들어가면 된다.
            Number(petId),
            {
                onSuccess: () => {USER_PATH()},
                onError: (error : Error) => { alert(error.message); return; }
            }
        ) 
    };

    // 객체 형태로 리턴해야 부모에서 { formData, updateField } 식으로 꺼내 씁니다.
    return { 
        formData, updateField, handleInputChange, onPetRegisterHandler,
        onPetUpdateHandler, onPetDeleteHandler
    };
};