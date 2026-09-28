
import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Package,
    Layers3,
    IndianRupee,
    ReceiptText,
    Weight,
    Gem,
    Percent,
    Tag,
    CircleCheck,
    CircleX,
    ChevronDown,
    ChevronUp,
    ShoppingBag,
    Edit2
} from "lucide-react";
import { useComboProcuts } from "../../../hooks/combo/useCombo";
import PageHeader from "../../../components/pageHeader/PageHeader";
import { getProductImages } from "../../../../utils/mediaUtils/mediaUtils";


function ManageCombo() {

    const navigate = useNavigate();
    const {
        data: comboProducts,
        isLoading: comboLoading,
        isError: comboError,
    } = useComboProcuts();

    const [openCombo, setOpenCombo] = React.useState(null);

    if (comboLoading) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-2 shadow-sm">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                    <span className="text-sm font-medium text-slate-600">
                        Loading combo products...
                    </span>
                </div>
            </div>
        );
    }

    if (comboError) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-5 text-center">
                    <CircleX className="mx-auto mb-2 h-8 w-8 text-red-500" />
                    <p className="font-semibold text-red-700">
                        Failed to load combo products
                    </p>
                    <p className="mt-1 text-sm text-red-500">
                        Please try again later.
                    </p>
                </div>
            </div>
        );
    }

    const combos = Array.isArray(comboProducts)
        ? comboProducts
        : comboProducts?.data || [];

    if (!combos.length) {
        return (
            <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                    <Package className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                    <h3 className="font-semibold text-slate-700">
                        No Combo Products
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                        No combo products are available.
                    </p>
                </div>
            </div>
        );
    }

    const formatAmount = (amount = 0) =>
        Number(amount).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    const toggleCombo = (comboId) => {
        setOpenCombo((prev) => (prev === comboId ? null : comboId));
    };

    const handleEdit = (row) =>{
        console.log(row,"Editing Row");
        navigate("/admin/combo/add" , {state : row});

    }

    return (
        <div className="space-y-1 p-2 sm:p-2">

            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
               
                <div>
                    <PageHeader title={"Combo Products"} description={"Manage your bundled products and combo pricing"} icon={Layers3}/>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm">
                    <Package className="h-4 w-4 text-indigo-500" />
                    <span className="text-sm text-slate-500">
                        Total Combos
                    </span>
                    <span className="font-bold text-slate-800">
                        {combos.length}
                    </span>
                </div>
            </div>

            {/* Combo List */}
            <div className="grid gap-3">
                {combos.map((combo) => {

                    const isOpen = openCombo === combo.comboId;

                    return (
                        <div
                            key={combo.comboId}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
                        >

                            {/* ================= HEADER ================= */}
                            <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-950 p-2 text-white sm:p-3">

                                {/* Background decoration */}
                                {/* <div className="absolute -right-10 -top-16 h-40 w-40 rounded-full bg-violet-500/20 blur-2xl" />
                                <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-indigo-500/20 blur-2xl" /> */}

                                <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                    {/* Combo Info */}
                                    <div className="flex items-start gap-3">

                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                                            <ShoppingBag className="h-6 w-6 text-violet-200" />
                                        </div>

                                        <div>
                                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                                <h2 className="text-lg font-bold sm:text-xl">
                                                    {combo.comboName}
                                                </h2>

                                                {combo.active === "Y" ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
                                                        <CircleCheck className="h-3 w-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-400/15 px-2.5 py-1 text-[11px] font-semibold text-red-300 ring-1 ring-red-400/20">
                                                        <CircleX className="h-3 w-3" />
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                                                <span>
                                                    Combo Code:{" "}
                                                    <strong className="text-white">
                                                        {combo.comboCode}
                                                    </strong>
                                                </span>

                                                <span>
                                                    ID:{" "}
                                                    <strong className="text-white">
                                                        {combo.comboId}
                                                    </strong>
                                                </span>

                                                <span>
                                                    {combo.items?.length || 0} Items
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center gap-3">
                                      
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(combo)}
                                            className="
                                                        inline-flex items-center gap-1.5
                                                        rounded-lg
                                                        bg-gradient-to-r from-indigo-500 to-violet-500
                                                        px-3 py-1.5
                                                        text-sm font-semibold text-white
                                                        shadow-sm shadow-indigo-200
                                                        transition-all duration-200
                                                        hover:-translate-y-0.5
                                                        hover:from-indigo-600
                                                        hover:to-violet-600
                                                        hover:shadow-md hover:shadow-indigo-200
                                                        active:translate-y-0
                                                        active:scale-95
                                                    "
                                        >
                                            <Edit2 size={15} strokeWidth={2.2} />
                                            Edit
                                        </button>
                                        

                                    <div className="flex items-center justify-between gap-5 rounded-xl bg-white/10 px-2 py-2 ring-1 ring-white/10 backdrop-blur sm:justify-start">
                                       
                                        
                                        <div>
                                            <p className="text-[11px] uppercase tracking-wider m-0 text-slate-400">
                                                Combo Price
                                            </p>

                                            <p className="m-0.5 text-xl font-bold">
                                                ₹ {formatAmount(combo.comboPrice)}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => toggleCombo(combo.comboId)}
                                            className="rounded-lg bg-white/10 p-2 m-0 transition hover:bg-white/20"
                                        >
                                            {isOpen ? (
                                                <ChevronUp className="h-5 w-5" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    </div>
                                </div>
                            </div>

                            {/* ================= SUMMARY ================= */}
                            <div className="grid grid-cols-2 border-b border-slate-100 bg-slate-50/70 sm:grid-cols-3 lg:grid-cols-6">

                                <SummaryItem
                                    label="Gross"
                                    value={`₹ ${ formatAmount(combo.totalGross) } `}
                                />

                                <SummaryItem
                                    label="Making Charges"
                                    value={`₹ ${ formatAmount(combo.totalMc) } `}
                                />

                                <SummaryItem
                                    label="GST"
                                    value={`₹ ${ formatAmount(combo.totalGst) } `}
                                />

                                <SummaryItem
                                    label="Stone"
                                    value={`₹ ${ formatAmount(combo.totalStone) } `}
                                />

                                <SummaryItem
                                    label="Discount"
                                    value={`₹ ${ formatAmount(combo.totalDiscount) } `}
                                />

                                <SummaryItem
                                    label="Grand Total"
                                    value={`₹ ${ formatAmount(combo.totalGrandTotal) } `}
                                    highlight
                                />
                            </div>

                            {/* ================= ITEMS ================= */}
                            {isOpen && (
                                <div className="border-t border-slate-100">

                                    <div className="flex items-center justify-between p-1">
                                        <div>
                                            <h3 className="font-semibold text-lg m-0 text-slate-800">
                                                Combo Items
                                            </h3>

                                            <p className="text-xs m-0 text-slate-500">
                                                Products included in this combo
                                            </p>
                                        </div>

                                        <span className="rounded-full bg-indigo-50 px-3 m-0 py-1 text-xs font-semibold text-indigo-600">
                                            {combo.items?.length || 0} Items
                                        </span>
                                    </div>

                                    <div className="grid gap-3 px-2 pb-2 sm:px-3">
                                        {combo.items?.map((item, index) => (
                                            <ComboItem
                                                key={`${ item.tagKey } -${ index } `}
                                                item={item}
                                                formatAmount={formatAmount}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ================= FOOTER ================= */}
                            <div className="flex flex-col gap-3 border-t border-slate-100 p-2 sm:flex-row sm:items-center sm:justify-between sm:px-3">

                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                    <span>
                                        Available Items:{" "}
                                        <strong className="text-slate-700">
                                            {(combo.items?.length || 0) -
                                                (combo.unavailableCount || 0)}
                                        </strong>
                                    </span>

                                    {combo.unavailableCount > 0 && (
                                        <span className="text-red-500">
                                            {combo.unavailableCount} unavailable
                                        </span>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => toggleCombo(combo.comboId)}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                                >
                                    {isOpen ? (
                                        <>
                                            Hide Details
                                            <ChevronUp className="h-4 w-4" />
                                        </>
                                    ) : (
                                        <>
                                            View Details
                                            <ChevronDown className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


/* =========================================================
   SUMMARY ITEM
========================================================= */

function SummaryItem({ label, value, highlight }) {
    return (
        <div
            className={`border-r border-b border-slate - 100 px-3 py-2 m-0 last: border -r-0 sm: px-4 ${
    highlight
        ? "bg-indigo-50/70"
        : "bg-white/30"
} `}
        >
            <p className="text-[10px] font-medium uppercase tracking-wide m-0 text-slate-400">
                {label}
            </p>

            <p
                className={`m-0 truncate text-sm font-bold ${
    highlight
        ? "text-indigo-700"
        : "text-slate-700"
} `}
            >
                {value}
            </p>
        </div>
    );
}


/* =========================================================
   COMBO ITEM
========================================================= */

function ComboItem({ item, formatAmount }) {

    const image = item.images?.[0];

    return (
        <div className="group rounded-xl border border-slate-200 bg-white p-3 transition hover:border-indigo-200 hover:shadow-sm sm:p-4">

            <div className="flex flex-col gap-4 lg:flex-row">

                {/* Product Image */}
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-32 sm:w-32">

                    {image ? (
                        <img
                            src={getProductImages(image)}
                            alt={item.itemName}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-300">
                            <Package className="h-9 w-9" />
                        </div>
                    )}

                    {/* Quantity */}
                    <span className="absolute right-2 top-2 rounded-full bg-slate-950/80 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                        Qty {item.qty}
                    </span>
                </div>

                {/* Product Details */}
                <div className="min-w-0 flex-1">

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">

                        <div>
                            <div className="flex flex-wrap items-center gap-2">

                                <h4 className="font-bold text-sm text-slate-800">
                                    {item.itemName}
                                </h4>

                                {item.available ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                                        <CircleCheck className="h-3 w-3" />
                                        Available
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                                        <CircleX className="h-3 w-3" />
                                        Unavailable
                                    </span>
                                )}
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                                {item.subItemName}
                            </p>
                        </div>

                        <div className="text-left sm:text-right">
                            <p className="text-lg font-bold text-slate-800">
                                ₹ {formatAmount(item.finalAmount)}
                            </p>

                            <p className="text-[11px] text-slate-400">
                                Final Amount
                            </p>
                        </div>

                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">

                        <InfoBadge
                            icon={Tag}
                            label="Tag"
                            value={item.tagNo}
                        />

                        <InfoBadge
                            icon={Weight}
                            label="Gross"
                            value={`${ item.grsWt } g`}
                        />

                        <InfoBadge
                            icon={Weight}
                            label="Net"
                            value={`${ item.netWt } g`}
                        />

                        <InfoBadge
                            icon={Gem}
                            label="Purity"
                            value={`${ item.purity }% `}
                        />

                        <InfoBadge
                            icon={IndianRupee}
                            label="Rate"
                            value={`₹${ item.rate } `}
                        />

                        <InfoBadge
                            icon={Percent}
                            label="GST"
                            value={item.gstPer}
                        />
                    </div>

                    {/* Amount Breakdown */}
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">

                        <AmountBox
                            label="Gross Amount"
                            value={item.grossAmount}
                            formatAmount={formatAmount}
                        />

                        <AmountBox
                            label="Making Charges"
                            value={item.makingCharges}
                            formatAmount={formatAmount}
                        />

                        <AmountBox
                            label="GST"
                            value={item.gstAmount}
                            formatAmount={formatAmount}
                        />

                        <AmountBox
                            label="Total"
                            value={item.grandTotal}
                            formatAmount={formatAmount}
                            highlight
                        />

                    </div>

                    {/* Extra info */}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
                        <span>
                            S.No:{" "}
                            <strong className="text-slate-600">
                                {item.sno}
                            </strong>
                        </span>

                        <span>
                            Item ID:{" "}
                            <strong className="text-slate-600">
                                {item.itemId}
                            </strong>
                        </span>

                        <span>
                            Tag Key:{" "}
                            <strong className="text-slate-600">
                                {item.tagKey}
                            </strong>
                        </span>
                    </div>

                </div>
            </div>
        </div>
    );
}


/* =========================================================
   INFO BADGE
========================================================= */

function InfoBadge({ icon: Icon, label, value }) {
    return (
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1.5">
            <Icon className="h-3.5 w-3.5 text-indigo-500" />

            <span className="text-[10px] text-slate-400">
                {label}
            </span>

            <span className="text-[11px] font-semibold text-slate-700">
                {value}
            </span>
        </div>
    );
}


/* =========================================================
   AMOUNT BOX
========================================================= */

function AmountBox({
    label,
    value,
    formatAmount,
    highlight = false,
}) {
    return (
        <div
            className={`rounded-lg border px-3 py-2 ${
    highlight
        ? "border-indigo-100 bg-indigo-50"
        : "border-slate-100 bg-slate-50/70"
} `}
        >
            <p className="text-[9px] m-0 uppercase tracking-wide text-slate-400">
                {label}
            </p>

            <p
                className={`m-0.5 text-xs font-bold ${
    highlight
        ? "text-indigo-700"
        : "text-slate-700"
} `}
            >
                ₹ {formatAmount(value)}
            </p>
        </div>
    );
}

export default ManageCombo;

