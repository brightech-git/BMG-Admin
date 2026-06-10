import axiosInstance from "../api/axiosInstance";
// ✅ Create new employee
export const createUser = async (values) => {

    const payload = {
        username: values.username,
        password: values.password,
        email: values.email,
        roles: typeof values.roles === 'string' ? values.roles : values.roles[0],
        contactNumber: values.contactNumber,
    };

    const response = await axiosInstance.post(
        `/admin/create-employee`,
        payload
    );

    return response.data;
};

// Get all users (for admin table view)
export const getAllUsers = async () => {
    const response = await axiosInstance.get('/auth/user/getAllUserMasterData');
    return response.data;
};

// Delete user by ID
export const deleteUserById = async (id) => {
    const response = await axiosInstance.delete(`/auth/user/deleteUserById/${id}`);
    return response.data;
};