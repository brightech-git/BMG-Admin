
import React, { useMemo, useState } from "react";
import {
    Check,
    CircleAlert,
    PackagePlus,
    Plus,
    RotateCcw,
    ScanLine,
    Trash2,
    X,
} from "lucide-react";
import { useLocation ,useNavigate } from "react-router-dom";
import PageHeader from "../../../components/pageHeader/PageHeader"
import { FieldRow } from "../../../components/form/FieldRow";
import { useProductContext } from "../../../context/product/productContext";
import { getImage } from "../../../../utils/mediaUtils/mediaUtils";
import {useCombo, useUpdateCombo} from "../../../hooks/combo/useCombo";
import { Switch } from "../../../components/ui/Switch";

const mapComboItemToProduct = (item) => ({
    ITEMID: item.itemId,
    TAGNO: item.tagNo,
    ITEMNAME: item.itemName,
    SUBITEMNAME: item.subItemName,
    FinalAmount: item.finalAmount,
    ImagePath: item.images?.[0],
    NETWT: item.netWt,
    GRWT: item.grsWt,
    PURITY: item.purity,
    RATE: item.rate,
});


function AddComboProducts() {
    const { getProductDetails } = useProductContext();
    const location = useLocation();
    const navigate =useNavigate();

    const editItem = location.state;

    console.log(editItem , "editItem")

    const isEditMode = Boolean(editItem?.comboId);
    console.log(isEditMode , "isEditing")

    const [form, setForm] = useState({
        comboName: editItem?.comboName || "",
        isActive : editItem?.active || "N",
    });
    console.log(form ,"AddCombo")

    const [items, setItems] = useState(
        editItem?.items?.map(mapComboItemToProduct) || []
    );

    const {mutate : createCombo} = useCombo();

    const {
        mutate: updateCombo,
        isPending: isUpdating,
    } = useUpdateCombo();

    const [tagKey, setTagKey] = useState("");
    const [itemDetails, setItemDetails] = useState(null);
    const [error, setError] = useState("");


  

    const handleChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleTagChange = (value) => {
        setTagKey(value);
        setError("");
    };

    const handleOnEnter = async (
        e
    ) => {
        if (e.key !== "Enter") return;

        e.preventDefault();

        const tag = tagKey?.trim();

        if (!tag) {
            setError("Please enter a Tag Key.");
            return;
        }

        // Prevent duplicate items
        const alreadyAdded = items.some(
            (item) => item.TAGNO === tag
        );

        if (alreadyAdded) {
            setError("This item has already been added.");
            setTagKey("");
            return;
        }

        try {
            const details = await getProductDetails(tag);

            if (!details) {
                setError("No product found for this Tag Key.");
                return;
            }

            setItemDetails(details);
            setError("");
        } catch (error) {
            console.error(error);
            setError("Unable to fetch product details.");
        }
    };

    const addItemToCombo = () => {
        if (!itemDetails) return;

        const alreadyAdded = items.some(
            (item) => item.TAGNO === itemDetails.TAGNO
        );

        if (alreadyAdded) {
            setError("This item has already been added.");
            return;
        }

        setItems((prev) => [...prev, itemDetails]);

        setItemDetails(null);
        setTagKey("");
        setError("");
    };

    const removeItem = (index) => {
        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const totalPrice = useMemo(() => {
        return items.reduce(
            (total, item) =>
                total + Number(item.FinalAmount || 0),
            0
        );
    }, [items]);

    const canCreate = form.comboName?.trim() && items.length >= 2;

    const handleSubmit = () => {
        if (!form.comboName?.trim()) {
            setError("Please enter a combo name.");
            return;
        }

        if (items.length < 2) {
            setError("A combo must contain at least 2 items.");
            return;
        }

        const payload = {
            comboName: form.comboName?.trim(),
            active :form.isActive,
            // comboPrice: totalPrice,
            items: items.map((item) => ({
                itemId: item.ITEMID,
                tagNo: item.TAGNO,
            })),
        };
        if (isEditMode) {

            const updatePayload = {
                comboId: editItem.comboId,
                ...payload,
            };

            console.log("UPDATE PAYLOAD", updatePayload);

            updateCombo(updatePayload, {
                onSuccess: () => {
                    navigate("/admin/combo/manage");
                },
                onError: (error) => {
                    console.error(error);
                    setError("Unable to update combo.");
                },
            });

            return;
        }
        console.log("create payload", payload)

        createCombo(payload ,{
            onSuccess : ()=>{
                setTagKey("");
                setItemDetails();
                setItems([]);
                setError(null);
            },
            onError: (error)=>{
                console.error(error);
                setError("Unable to create combo.");
            }
        })
      

        // API call here
    };

    const handleReset = () =>{
        console.log("triggers")
        setError("");
        setItems([]);
        setItemDetails(null);
        setTagKey("");
        setForm({comboName :''});

        return isEditMode ? navigate("/admin/combo/manage") : null;
    }

    return (
        <div className="min-h-screen bg-slate-50">

            <PageHeader
                title="Create Combo"
                description="Group two or more products together as a combo"
               
            />

            <div className="mx-auto max-w-6xl p-2 sm:p-4">

                    {/* ---------------------------------
                    BASIC DETAILS
                ---------------------------------- */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 px-3 py-2 ">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                                    <PackagePlus size={20} />
                                </div>

                                <div>
                                    <h2 className="text-base m-0 font-semibold text-slate-800">
                                        Combo Details
                                    </h2>

                                    <p className="text-sm m-0 text-slate-500">
                                        Give your combo a name
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-2">

                            <FieldRow
                                label="Combo Name"
                                required
                            >
                                <input
                                    type="text"
                                    value={form.comboName}
                                    placeholder="Enter Combo Name"
                                    onChange={(e) =>
                                        handleChange(
                                            "comboName",
                                            e.target.value
                                        )
                                    }
                                    className="
                                    sm:min-w-[300px]
                                    rounded-lg
                                    border border-slate-300
                                    bg-white px-3 py-2.5
                                    text-sm
                                    outline-none
                                    transition
                                    focus:border-orange-500
                                    focus:ring-2
                                    focus:ring-orange-100
                                   
                                "
                                />
                            </FieldRow>
                        <Switch label={"Active"} checked={form.isActive} onChange={(val) => handleChange("isActive" , val)}/>

                        </div>
                    </div>

                    {/* ---------------------------------
                    PICK ITEMS
                ---------------------------------- */}
                    <div className="mt-2 rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 px-3 py-2">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex items-center gap-2">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                        <ScanLine size={20} />
                                    </div>

                                    <div>
                                        <h2 className="text-base m-0 font-semibold text-slate-800">
                                            Pick Items
                                        </h2>

                                        <p className="text-sm m-0 text-slate-500">
                                            Add at least 2 products to create a combo
                                        </p>
                                    </div>

                                </div>

                                {/* ITEM COUNT */}
                                <div
                                    className={`
inline - flex w - fit items - center gap - 2
rounded - full px - 3 py - 1.5
text - xs font - semibold
                                    ${items.length >= 2
                                            ? "bg-emerald-50 text-emerald-700"
                                            : "bg-amber-50 text-amber-700"
                                        }
`}
                                >
                                    {items.length >= 2 && (
                                        <Check size={14} />
                                    )}

                                    {items.length} / 2 minimum
                                </div>

                            </div>
                        </div>

                        <div className="p-3">

                            {/* SCANNER INPUT */}

                            <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50/40 p-4">

                                <label className="mb-2 block text-sm font-medium text-slate-700">
                                    Scan / Enter Tag Key
                                </label>

                                <div className="flex flex-col gap-2 sm:flex-row">

                                    <div className="relative flex-1">

                                        <ScanLine
                                            size={18}
                                            className="
                                            absolute
                                            left-3
                                            top-1/2
                                            -translate-y-1/2
                                            text-slate-400
                                        "
                                        />

                                        <input
                                            autoFocus
                                            type="text"
                                            value={tagKey}
                                            placeholder="Scan tag or enter tag key..."
                                            onChange={(e) =>
                                                handleTagChange(
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={handleOnEnter}
                                            className="
                                            w-full
                                            rounded-lg
                                            border
                                            border-slate-300
                                            bg-white
                                            py-2.5
                                            pl-10
                                            pr-3
                                            text-sm
                                            outline-none
                                            focus:border-orange-500
                                            focus:ring-2
                                            focus:ring-orange-100
                                        "
                                        />

                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleOnEnter({
                                                key: "Enter",
                                                preventDefault: () => { },
                                            })
                                        }
                                        className="
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-full
                                        bg-orange-600
                                        px-3
                                        py-2
                                        text-sm
                                        font-medium
                                        text-white
                                        transition
                                        hover:bg-orange-700
                                    "
                                    >
                                        <Plus size={17} />
                                        Add Item
                                    </button>

                                </div>

                                {error && (
                                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                                        <X size={16} />
                                        {error}
                                    </div>
                                )}

                            </div>

                            {/* ---------------------------------
                            FOUND ITEM PREVIEW
                        ---------------------------------- */}

                            {itemDetails && (
                                <div className="rounded-xl border border-orange-200 bg-orange-50/30 p-2">

                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

                                        <img
                                            src={getImage(
                                                itemDetails.ImagePath
                                            )}
                                            alt={itemDetails.ITEMNAME}
                                            className="
                                            h-20
                                            w-20
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            object-cover
                                        "
                                        />

                                        <div className="min-w-0 flex-1">

                                            <div className="flex flex-wrap items-center gap-1">

                                                <h3 className="font-semibold text-sm text-slate-800">
                                                    {itemDetails.ITEMNAME}
                                                </h3>

                                                <span className="rounded-full bg-white px-2 py-1 text-xs text-slate-500">
                                                    New Item
                                                </span>

                                            </div>

                                            <p className="m-0 text-sm text-slate-500">
                                                {itemDetails.SUBITEMNAME}
                                            </p>

                                            <div className="mt-1 flex flex-wrap gap-4 text-sm">

                                                <span className="font-medium text-slate-700">
                                                    ₹
                                                    {Number(
                                                        itemDetails.FinalAmount || 0
                                                    ).toFixed(2)}
                                                </span>

                                                {itemDetails.NETWT && (
                                                    <span className="text-slate-500">
                                                        Weight:{" "}
                                                        {itemDetails.NETWT}
                                                    </span>
                                                )}

                                            </div>

                                        </div>

                                        <button
                                            type="button"
                                            onClick={addItemToCombo}
                                            className="
                                            inline-flex
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-full
                                            bg-emerald-600
                                            px-4
                                            py-2
                                            text-sm
                                            font-medium
                                            text-white
                                            hover:bg-emerald-700
                                        "
                                        >
                                            <Plus size={17} />
                                            Add to Combo
                                        </button>

                                    </div>

                                </div>
                            )}

                            {/* ---------------------------------
                            SELECTED ITEMS
                        ---------------------------------- */}

                            <div className="mt-2">

                                <div className="flex items-center justify-between">

                                    <div>
                                        <h3 className="text-sm m-0 font-semibold text-slate-800">
                                            Selected Items
                                        </h3>

                                        <p className="text-xs text-slate-500">
                                            Products included in this combo
                                        </p>
                                    </div>

                                    {items.length > 0 && (
                                        <span className="text-sm font-medium text-slate-600">
                                            {items.length} item
                                            {items.length !== 1
                                                ? "s"
                                                : ""}
                                        </span>
                                    )}

                                </div>

                                {items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">

                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                                            <PackagePlus size={22} />
                                        </div>

                                        <p className="text-sm font-medium text-slate-600">
                                            No items added yet
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Scan or enter a Tag Key above to
                                            add products
                                        </p>

                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-xl border border-slate-200">

                                        <div className="hidden grid-cols-[1fr_120px_60px] border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
                                            <span>Product</span>
                                            <span>Price</span>
                                            <span />
                                        </div>

                                        <div className="divide-y divide-slate-100">

                                            {items.map((item, index) => (
                                                <div
                                                    key={`${item.TAGNO} -${index} `}
                                                    className="
                                                    grid
                                                    grid-cols-1
                                                    gap-3
                                                    px-2
                                                    py-2
                                                    sm:grid-cols-[1fr_120px_60px]
                                                    sm:items-center
                                                "
                                                >

                                                    <div className="flex items-center gap-3">

                                                        <img
                                                            src={getImage(
                                                                item.ImagePath
                                                            )}
                                                            alt={
                                                                item.ITEMNAME
                                                            }
                                                            className="
                                                            h-12
                                                            w-12
                                                            rounded-lg
                                                            border
                                                            border-slate-200
                                                            object-cover
                                                        "
                                                        />

                                                        <div>
                                                            <span className="flex flex-col sm:flex-row items-center gap-2 m-0">
                                                                <p className="text-sm font-medium text-slate-800">
                                                                    {
                                                                        item.ITEMNAME
                                                                    }
                                                                </p>

                                                                <p className="text-xs text-slate-500">
                                                                    {
                                                                        item.SUBITEMNAME
                                                                    }
                                                                </p>
                                                            </span>
                                                           

                                                            {item.TAGNO && (
                                                                <p className="m-0 text-xs text-slate-400">
                                                                    Tag:{" "}
                                                                    {
                                                                        item.TAGNO
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                    </div>

                                                    <div className="text-sm font-semibold text-slate-700">
                                                        ₹
                                                        {Number(
                                                            item.FinalAmount || 0
                                                        ).toFixed(2)}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(index)
                                                        }
                                                        className="
                                                        flex
                                                        h-9
                                                        w-9
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        text-slate-400
                                                        hover:bg-red-50
                                                        hover:text-red-600
                                                    "
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>

                                                </div>
                                            ))}

                                        </div>
                                    </div>
                                )}

                            </div>

                        </div>
                    </div>
              


                {/* ---------------------------------
                    SUMMARY
                ---------------------------------- */}

                <div className="mt-2 rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-2 p-2 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <p className="text-sm m-0 text-slate-500">
                                Combo Total
                            </p>

                            <p className="text-2xl m-0 font-bold text-slate-900">
                                ₹{totalPrice.toFixed(2)}
                            </p>

                            <p className="text-xs m-0 text-slate-400">
                                Sum of selected product prices
                            </p>
                        </div>
                        <div className=" flex gap-2">
                            <button
                                onClick={handleReset}
                                className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-full
                                bg-orange-600
                                px-3
                                py-2
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-orange-700
                                disabled:cursor-not-allowed
                                disabled:bg-slate-300
                            "
                            >
                                <RotateCcw size={14} />
                                Reset
                            </button>
                            <button
                                type="button"
                                disabled={!canCreate}
                                onClick={handleSubmit}
                                className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                rounded-full
                                bg-orange-600
                                px-3
                                py-2
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-orange-700
                                disabled:cursor-not-allowed
                                disabled:bg-slate-300
                            "
                            >
                                <Check size={18} />
                                {isEditMode ? 'Update Combo' : 'Create Combo'}
                            </button>
                        </div>
                      
                    </div>

                    {items.length < 2 && (
                        <div className="border-t border-amber-100 bg-amber-50 px-2 py-2 text-sm text-amber-700">
                            Add at least{" "}
                            <strong>{2 - items.length}</strong>{" "}
                            more item
                            {2 - items.length !== 1 ? "s" : ""} to
                            create this combo.
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}

export default AddComboProducts
