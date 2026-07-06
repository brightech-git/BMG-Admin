import NavigationTreeMaster from "../../../components/navigation/NavigationTreeMaster";
import {
    useGetAllFooters,
    useCreateFooter,
    useUpdateFooter,
    useDeleteFooter,
} from "../../../hooks/navItems/useNavigationTree";

const FooterTreePage = () => (
    <NavigationTreeMaster
        title="Footer Management"
        description="Build and manage navigation footer menus"
        useGetAll={useGetAllFooters}
        useCreate={useCreateFooter}
        useUpdate={useUpdateFooter}
        useDelete={useDeleteFooter}
    />
);

export default FooterTreePage;
