import { fileUploadRequest } from "@/apis/user";
import { useMutation } from "@tanstack/react-query";

export const fileQueries = {
    useUploadFile() {
        return useMutation({
            mutationFn: (formData: FormData) => fileUploadRequest(formData),
            onSuccess: (data) => {
                console.log("업로드 성공:", data);
            }
        });
    }
};