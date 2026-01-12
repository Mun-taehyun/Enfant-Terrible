import { useState } from "react";

export const usePet = () => {
    const [formData, setFormData] = useState({
        name: '',
        species: '',
        breed: '',
        age: 0,
        gender: '', 
        isNeutered: null as boolean | null,
        activityLevel: null as number | null,
        weight: 5.0
    });

    // 1. 모든 변수에 대한 통합 핸들러 (커스텀 컴포넌트용)
    const updateField = <K extends keyof typeof formData>(
        key: K, 
        value: typeof formData[K] // key에 해당하는 정확한 타입을 강제함
    ) => {setFormData(prev => ({...prev,[key]: value,
            // 종이 변경될 때만 breed를 초기화
            ...(key === 'species' ? { breed: '' } : {})
        }));
    };

    // 2. 일반 Input 엘리먼트용 핸들러 (e.target.value 처리)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateField(name as keyof typeof formData, value);
        //keyof typeof => key에 formData의 모든 타입이 존재 name , species 등...... 을 value로 기입 
    };

    const onPetRegisterHandler = () => {
        // 유효성 검사 로직 (간단 예시)
        if (!formData.name) return alert("이름을 입력해주세요!");
        if (!formData.species) return alert("종류를 선택해주세요!");
        
        console.log("서버로 전송할 데이터:", formData);
    };

    // 객체 형태로 리턴해야 부모에서 { formData, updateField } 식으로 꺼내 씁니다.
    return { 
        formData, 
        updateField, 
        handleInputChange, 
        onPetRegisterHandler 
    };
};