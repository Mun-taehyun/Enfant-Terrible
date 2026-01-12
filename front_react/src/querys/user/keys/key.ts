//key 관리 : user(사용자)
export const userKey = {
  all: ['user'] as const,

  me: () => [...userKey.all, 'me'] as const, // user , me 까지 있어야 의미 oo

  pets: () => [...userKey.all, 'pets'] as const, // user , pets 까지 있어야 의미 oo

  petIds: (petId: number| string) => [...userKey.all, 'pets', petId] as const
  //특정id 삭제 시 필요 
};


//key 관리 : auth(인증)
export const authKey = {
  signIn: ['auth', 'signIn'] as const,
  emailCertification: ['auth', 'emailCertification'] as const,
  emailCode: ['auth', 'emailCode'] as const,
  resetPasswordEmail: ['auth', 'resetPasswordEmail'] as const,
  resetPasswordCode: ['auth', 'resetPasswordCode'] as const,
  resetPasswordChange: ['auth', 'resetPasswordChange'] as const,
};
