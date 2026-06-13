
import { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import {
    Box, Typography, Button, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, Alert,
    IconButton, Tooltip, Dialog, DialogTitle,
    DialogContent, DialogActions, Stack, Card, CardContent,
    TextField, Avatar, MenuItem ,Chip
} from '@mui/material';
import { Visibility, Edit, Delete, Add, Refresh, Search, CloudUpload } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useBannersQuery } from '../../../hooks/banners/breadcrumbBanner/useBreadCrumbBannerQuery';
import { useDeleteBreadCrumbBannerMutation } from '../../../hooks/banners/breadcrumbBanner/useBreadCrumbBanner';
import { MyContext } from '../../../context/themeContext/themeContext';
import './ManageBreadCrumbBanner.css';
import BannerTable from '../../../components/banner/manageBannerTable';
import { getProductImages } from '../../../../utils/mediaUtils/mediaUtils';
import { FaTrash ,FaEdit } from 'react-icons/fa';

const BASE_IMAGE_URL = 'https://app.bmgjewellers.com';

const ManageBreadCrumbBanner = () => {
   const navigate = useNavigate();
  
      const { data: bannersData, isLoading, refetch } = useBannersQuery();
    const { mutate: deleteBanner } = useDeleteBreadCrumbBannerMutation();
  const banner = bannersData?.data || {};
      // Use memo to avoid unnecessary recalculations
     const banners = useMemo(() => {
    return Array.isArray(banner?.categories)
        ? banner.categories
        : [];
}, [bannersData]);
    console.log(banners, 'banner')
      const handleDelete = (id) => {
          if (window.confirm("Delete this banner?")) {
              deleteBanner(id, {
                  onSuccess: () => refetch(), // Refresh list after deletion
              });
          }
      };
  
      const tableData = banners.map((item, index) => ({

          id: item.id,
          sno: index + 1,
          image_path: getProductImages(item.image),
          // title: item.title || "—",
          // subtitle: item.subtitle || "—",
          itemname: item.ITEMNAME || "—",
          page:item.pages
      }));
      const handleOnClick = () =>{
          navigate('/admin/breadcrumbbanner/add')
      }
  
      return (
          <div className="max-w-8xl mx-auto mt-3 p-3 sm:p-4 sm:mt-4">
              <BannerTable
                  title="Manage Main Banners"
                  button="Add Banner"
                  onClick = {handleOnClick}
                  headers={[
                      { key: "sno", label: "S.No" },
                      { key: "image_path", label: "Image" },
                      // { key: "title", label: "Title" },
                      // { key: "subtitle", label: "Subtitle" },
                      { key: "itemname", label: "Item Name" },
                      { key: "page", label: "Page Name" },
                      { key: "actions", label: "Actions", align: "center" },
                  ]}
                  data={tableData}
                  renderCell={(key, row) => {
                      if (key === "image_path") {
                          return (
                              <img
                                  src={getProductImages(row.image_path)}
                                  alt={row.title}
                                  width={60}
                                  height={40}
                                  className="rounded shadow-sm object-contain"
                              />
                          );
                      }
                      if (key === "actions") {
                          return (
                              <div className="flex gap-2 justify-center">
                                  <button
                                      onClick={() => navigate('/admin/breadcrumbbanner/add', { state: { id: row.id, mode: 'edit' } })}
                                      className="text-blue-600 hover:text-blue-800 transition-colors"
                                      title="Edit"
                                  >
                                      <FaEdit size={16} />
                                  </button>
                                  <button
                                      onClick={() => handleDelete(row.id)}
                                      className="text-red-600 hover:text-red-800 transition-colors"
                                      title="Delete"
                                  >
                                      <FaTrash size={16} />
                                  </button>
                              </div>
                          );
                      }
                      return row[key];
                  }}
                  loading={isLoading}
                  emptyMessage="No banners found"
              />
          </div>
      );
  };
  
export default ManageBreadCrumbBanner;