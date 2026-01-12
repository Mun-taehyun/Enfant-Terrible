import './style.css';
import InputBox from '@/components/user/CustomComponent/InputBox';
import { SideStepper } from '@/components/user/CustomComponent/Stepper';
import { ToggleSelect } from '@/components/user/CustomComponent/ToggleBox';
import { ScrollBox } from '@/components/user/CustomComponent/ScrollBox';
import { SelectBox } from '@/components/user/CustomComponent/SelectBox';
import { usePet } from '@/hooks/user/pet/pet.hook';
import { ACTIVITY_LEVEL_TYPES, GENDER_TYPES, NEUTERED_TYPES, PET_TYPES } from '@/constant/user/pet.index';


const BREED_DATA: Record<string, string[]> = {
    '강아지': ['비숑', '닥트리오', '스피츠', '말티즈', '푸들', '포메라니안'],
    '고양이': ['렉돌', '먼치킨', '샴', '러시안블루', '뱅갈'],
    '기타': ['햄스터', '토끼', '고슴도치']
};


//컴포넌트 : 펫 정보 기입란
export default function PetInfomation() {

    const {
        formData, updateField , onPetRegisterHandler , handleInputChange
    } = usePet();

    return (
    <div className='auth-card-box'>
        <div className='auth-card-top'>
            <div className='auth-card-title-box'>
                <div className='auth-card-title'>{'펫 정보 등록'}</div>
            </div>
            <div className="pet-form-group">
                <InputBox label='펫 이름*' type='text' placeholder='이름을 입력해주세요.' 
                        name='name' value={formData.name} error={false} onChange={handleInputChange} 
                />
            </div>
            <div className="pet-form-group">
                <ToggleSelect label='펫 종류' options={PET_TYPES} value={formData.species} 
                              onSelect={(value) => updateField('species', value as string)}
                              isSmall={false}
                />
            </div>
            <div className="pet-form-group">
                <SelectBox label="펫 품종" species={formData.species} value={formData.breed} 
                           onSelect={(value) => updateField('breed', value)} breedData={BREED_DATA}
                />
            </div>
            <div className="pet-form-group">
                <SideStepper label='나이' value={Number(formData.age)} 
                            onChange={(value) => updateField('age', value) } 
                            min={0} max={100} unit='세' />
            </div>
            <div className="pet-form-group">
                <ToggleSelect label='성별' options={GENDER_TYPES} value={formData.gender} 
                              onSelect={(value) => updateField('gender', value as string)}
                              isSmall={false}
                />
            </div>
            <div className="pet-form-group">
                <ToggleSelect label='중성화 여부' options={NEUTERED_TYPES} value={formData.isNeutered === null ? null : formData.isNeutered} 
                              onSelect={(value) => updateField('isNeutered', value as boolean)}
                              isSmall={false}
                />
            </div>
            <div className="pet-form-group">
                <ToggleSelect label='활동성 수치' options={ACTIVITY_LEVEL_TYPES} value={Number(formData.activityLevel)} 
                              onSelect={(value) => updateField('activityLevel', Number(value))}
                              isSmall={true}
                />
            </div>
            <div className="pet-form-group">
                <ScrollBox label='무게' value={Number(formData.weight)} 
                            onChange={(value) => updateField('weight', value)}
                            min={0} max={100} unit='kg'
                />
            </div>
        </div>
        <div className='auth-card-bottom'>
            <div className='black-large-full-button' onClick={onPetRegisterHandler}>{'등록 완료'}</div>
        </div>
    </div>
    );

}
