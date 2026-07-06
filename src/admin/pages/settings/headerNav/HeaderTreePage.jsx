import NavigationTreeMaster from "../../../components/navigation/NavigationTreeMaster";
import {
    useGetAllHeaders,
    useCreateHeader,
    useUpdateHeader,
    useDeleteHeader,
} from "../../../hooks/navItems/useNavigationTree";

const HeaderTreePage = () => (
    <NavigationTreeMaster
        title="Header Management"
        description="Build and manage navigation header menus"
        useGetAll={useGetAllHeaders}
        useCreate={useCreateHeader}
        useUpdate={useUpdateHeader}
        useDelete={useDeleteHeader}
    />
);

export default HeaderTreePage;
