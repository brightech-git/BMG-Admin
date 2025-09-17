import PublicUrl from "../api/publicUrl";

export const getAllSliderImages = () => PublicUrl.get("/banner/list");
export const getSliderImageById = (id) => PublicUrl.get(`/banner/${id}`);



