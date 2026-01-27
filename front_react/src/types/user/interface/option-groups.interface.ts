import OptionValue from "./option-value.interface";

export default interface OptionGroup{
    optionGroupId: number;
    name: string;
    values: OptionValue[];
}