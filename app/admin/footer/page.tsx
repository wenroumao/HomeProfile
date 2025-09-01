"use client";

import {useEffect, useState, useCallback, JSX} from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FiTrash2, FiPlusCircle, FiMoreVertical } from 'react-icons/fi';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from "react-i18next"; // Import useTranslation

// 导入uuid v4函数用于生成唯一ID
import { v4 as uuidv4 } from 'uuid';
// 为uuid模块添加类型声明
declare module 'uuid' {
  export function v4(): string;
}

// Keep these interfaces in sync with components/footer.tsx and app/api/footer/route.ts
interface FooterItemBase {
  id: string;
  type: string;
}
interface BeianItem extends FooterItemBase {
  type: "beian";
  icpBeian?: string;
  mengIcpBeian?: string;
  icpBeianUrl?: string;
  mengIcpBeianUrl?: string;
}
interface CopyrightItem extends FooterItemBase {
  type: "copyright";
  authorName: string;
  startYear: number;
}
interface CustomTextItem extends FooterItemBase {
  type: "customText";
  text: string;
}
interface Link {
  text: string;
  url: string;
  title?: string;
}
interface CustomLinksItem extends FooterItemBase {
  type: "customLinks";
  links: Link[];
}
type FooterItem = BeianItem | CopyrightItem | CustomTextItem | CustomLinksItem;
interface FooterSettings {
  items: FooterItem[];
}

// Generic function to create props for Input components - Needs t and handlers
const getInputProps = <T extends FooterItem>(item: T, itemIndex: number, fieldName: keyof T, handleItemFieldChange: (itemIndex: number, fieldName: string, value: any) => void, t: any, isNumeric: boolean = false) => ({
  id: `${item.type}-${itemIndex}-${String(fieldName)}`,
  value: String(item[fieldName] ?? (isNumeric ? 0 : '')),
  type: isNumeric ? "number" : "text",
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = isNumeric ? parseInt(e.target.value, 10) || 0 : e.target.value;
    handleItemFieldChange(itemIndex, fieldName as string, value);
  },
  className: "mt-1",
});

// Render form based on item type - Needs t and handlers
const renderItemForm = (item: FooterItem, index: number, handleItemFieldChange: (itemIndex: number, fieldName: string, value: any) => void, handleCustomLinkChange: (itemIndex: number, linkIndex: number, fieldName: keyof Link, value: string) => void, addLinkToCustomLinksItem: (itemIndex: number) => void, removeLinkFromCustomLinksItem: (itemIndex: number, linkIndex: number) => void, t: any) => {
  switch (item.type) {
    case "beian":
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`${item.type}-${index}-icpBeian`}>{t('adminFooter.beianLabelIcpBeian', 'ICP备案号')}</Label>
              <Input {...getInputProps(item as BeianItem, index, 'icpBeian', handleItemFieldChange, t)} placeholder={t('adminFooter.beianPlaceholderIcpBeian', '例如：京ICP备xxxxxxxx号-x')} />
            </div>
            <div>
              <Label htmlFor={`${item.type}-${index}-icpBeianUrl`}>{t('adminFooter.beianLabelIcpBeianUrl', 'ICP备案链接')}</Label>
              <Input {...getInputProps(item as BeianItem, index, 'icpBeianUrl', handleItemFieldChange, t)} placeholder={t('adminFooter.beianPlaceholderIcpBeianUrl', '例如：https://beian.miit.gov.cn/')} />
            </div>
            <div>
              <Label htmlFor={`${item.type}-${index}-mengIcpBeian`}>{t('adminFooter.beianLabelMengIcpBeian', '萌ICP备案号 (可选)')}</Label>
              <Input {...getInputProps(item as BeianItem, index, 'mengIcpBeian', handleItemFieldChange, t)} placeholder={t('adminFooter.beianPlaceholderMengIcpBeian', '例如：萌ICP备xxxxxxxx号')} />
            </div>
            <div>
              <Label htmlFor={`${item.type}-${index}-mengIcpBeianUrl`}>{t('adminFooter.beianLabelMengIcpBeianUrl', '萌ICP备案链接 (可选)')}</Label>
              <Input {...getInputProps(item as BeianItem, index, 'mengIcpBeianUrl', handleItemFieldChange, t)} placeholder={t('adminFooter.beianPlaceholderMengIcpBeianUrl', '例如：https://meng.icp.gov.moe/')} />
            </div>
          </div>
        </>
      );
    case "copyright":
      return null; // Do not render form for copyright items
    case "customText":
      return (
        <>
          <div>
            <Label htmlFor={`${item.type}-${index}-text`}>{t('adminFooter.customTextLabel', '自定义文本')}</Label>
            <Input {...getInputProps(item as CustomTextItem, index, 'text', handleItemFieldChange, t)} placeholder={t('adminFooter.customTextPlaceholder', '输入您想显示的任何文本 (支持HTML)')} />
          </div>
        </>
      );
    case "customLinks":
      const customLinksItem = item as CustomLinksItem;
      return (
        <>
          <h4 className="text-md font-medium mb-2">{t('adminFooter.customLinksTitle', '链接列表:')}</h4>
          {customLinksItem.links.map((link, linkIndex) => (
            <div key={linkIndex} className="p-3 border rounded-md mb-3 space-y-2 bg-slate-50 dark:bg-slate-800">
              <div className="flex justify-between items-center">
                {/* Use translation and placeholder for link number */}
                <p className="text-sm font-medium">{t('adminFooter.customLinksLinkNumber', '链接 #{{number}}', { number: linkIndex + 1 })}</p>
                <Button variant="ghost" size="icon" onClick={() => removeLinkFromCustomLinksItem(index, linkIndex)} aria-label={t('adminFooter.ariaLabelRemoveLink', '删除此链接')}>
                  <FiTrash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div>
                <Label htmlFor={`link-${index}-${linkIndex}-text`}>{t('adminFooter.customLinksLabelLinkText', '链接文字')}</Label>
                <Input 
                  id={`link-${index}-${linkIndex}-text`}
                  value={link.text}
                  onChange={(e) => handleCustomLinkChange(index, linkIndex, 'text', e.target.value)}
                  className="mt-1"
                  placeholder={t('adminFooter.customLinksPlaceholderLinkText', '例如：GitHub')}
                />
              </div>
              <div>
                <Label htmlFor={`link-${index}-${linkIndex}-url`}>{t('adminFooter.customLinksLabelLinkUrl', '链接URL')}</Label>
                <Input
                  id={`link-${index}-${linkIndex}-url`}
                  value={link.url}
                  onChange={(e) => handleCustomLinkChange(index, linkIndex, 'url', e.target.value)}
                  className="mt-1"
                  placeholder={t('adminFooter.customLinksPlaceholderLinkUrl', '例如：https://github.com')}
                />
              </div>
              <div>
                <Label htmlFor={`link-${index}-${linkIndex}-title`}>{t('adminFooter.customLinksLabelLinkTitle', '链接提示 (可选)')}</Label>
                <Input
                  id={`link-${index}-${linkIndex}-title`}
                  value={link.title || ''}
                  onChange={(e) => handleCustomLinkChange(index, linkIndex, 'title', e.target.value)}
                  className="mt-1"
                  placeholder={t('adminFooter.customLinksPlaceholderLinkTitle', '鼠标悬停时显示的文字')}
                />
              </div>
            </div>
          ))}
          <Button onClick={() => addLinkToCustomLinksItem(index)} className="mt-2" variant="outline" size="sm">
            <FiPlusCircle className="mr-2 h-4 w-4" /> {t('adminFooter.customLinksButtonAddLink', '添加链接')}
          </Button>
        </>
      );
    default:
      console.warn("Unknown footer item type in admin:", (item as any).type);
      // Use translation for unknown type message with placeholder
      return <p className="text-red-500">{t('adminFooter.unknownItemTypeError', { type: (item as any).type })}</p>;
  }
};

// Sortable Item Component
function SortableFooterItemCard({
  item,
  index,
  removeItem,
  renderItemForm // This will now be a function that takes t and handlers
}: {
  item: FooterItem;
  index: number;
  removeItem: (index: number) => void;
  renderItemForm: (item: FooterItem, index: number, handleItemFieldChange: (itemIndex: number, fieldName: string, value: any) => void, handleCustomLinkChange: (itemIndex: number, linkIndex: number, fieldName: keyof Link, value: string) => void, addLinkToCustomLinksItem: (itemIndex: number) => void, removeLinkFromCustomLinksItem: (itemIndex: number, linkIndex: number) => void, t: any) => JSX.Element | null;
}) {
  const { 
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined, // Elevate a bit when dragging
    opacity: isDragging ? 0.8 : 1, // Slightly transparent when dragging
  };

  const { t } = useTranslation(); // Call useTranslation inside the component

  if (item.type === "copyright") {
    return null; // Still skip rendering copyright items
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="mb-6">
      <Card className={`shadow-lg transition-all hover:shadow-xl ${isDragging ? 'ring-2 ring-primary' : ''}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button {...listeners} className="cursor-grab p-1 text-gray-500 hover:text-gray-700" aria-label={t('adminFooter.ariaLabelDragItem', '拖拽排序此行')}>
                <FiMoreVertical className="h-5 w-5" />
              </button>
              <CardTitle className="capitalize">{t(`admin.itemTypes.${item.type}`)}</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => removeItem(index)} aria-label={t('adminFooter.ariaLabelRemoveItem', '删除此项')}>
              <FiTrash2 className="h-5 w-5 text-red-500 hover:text-red-700 transition-colors" />
            </Button>
          </div>
          <CardDescription>{t('adminFooter.descriptionMain', '编辑下方的具体内容来更新此页脚行。拖动左侧手柄可排序。')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Call renderItemForm with t and handlers from FooterAdminPage */}
          {renderItemForm(item, index, (window as any).handleItemFieldChangeFromPage, (window as any).handleCustomLinkChangeFromPage, (window as any).addLinkToCustomLinksItemFromPage, (window as any).removeLinkFromCustomLinksItemFromPage, t)}
        </CardContent>
      </Card>
    </div>
  );
}

export default function FooterAdminPage() {
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({ items: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { t } = useTranslation(); // Call useTranslation inside FooterAdminPage

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchFooterSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/footer');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch footer settings: ${response.statusText}`);
      }
      let data: FooterSettings = await response.json();
      const itemsWithIds = (data.items || []).map(item => ({
        ...item,
        id: item.id || uuidv4(),
      }));
      setFooterSettings({ items: itemsWithIds });
    } catch (err: any) {
      console.error("Error fetching footer settings:", err);
      setError(err.message || "An unknown error occurred while fetching settings.");
      toast.error(t('adminFooter.toastFetchError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchFooterSettings();
  }, [fetchFooterSettings]);

  const handleSaveChanges = async () => {
    const settingsToSave = {
      ...footerSettings,
      items: footerSettings.items.map(({ id, ...rest }) => rest)
    };
    console.log("Attempting to save changes:", settingsToSave);
    const toastId = "save-footer-settings";
    toast.loading(t('adminFooter.toastLoading'), { id: toastId });
    try {
      const response = await fetch('/api/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to save settings: ${response.statusText}`);
      }
      const result = await response.json();
      toast.success(t('adminFooter.toastSuccess'), { id: toastId });
      fetchFooterSettings();
    } catch (err: any) {
      console.error("Error saving footer settings:", err);
      toast.error(t('adminFooter.toastSaveError'), { id: toastId });
    }
  };

  const handleItemFieldChange = (itemIndex: number, fieldName: string, value: any) => {
    setFooterSettings(prevSettings => {
      const updatedItems = prevSettings.items.map((item, idx) => {
        if (idx === itemIndex) {
          if (fieldName === 'startYear' && typeof value === 'string') {
            const parsedValue = parseInt(value, 10);
            return { ...item, [fieldName]: isNaN(parsedValue) ? 0 : parsedValue };
          }
          return { ...item, [fieldName]: value };
        }
        return item;
      });
      return { ...prevSettings, items: updatedItems };
    });
  };
  
  const handleCustomLinkChange = (itemIndex: number, linkIndex: number, fieldName: keyof Link, value: string) => {
    setFooterSettings(prevSettings => {
      const updatedItems = prevSettings.items.map((item, idx) => {
        if (idx === itemIndex && item.type === 'customLinks') {
          const updatedLinks = item.links.map((link, lIdx) => {
            if (lIdx === linkIndex) {
              return { ...link, [fieldName]: value };
            }
            return link;
          });
          return { ...item, links: updatedLinks };
        }
        return item;
      });
      return { ...prevSettings, items: updatedItems };
    });
  };

  const addLinkToCustomLinksItem = (itemIndex: number) => {
    setFooterSettings(prevSettings => {
      const updatedItems = prevSettings.items.map((item, idx) => {
        if (idx === itemIndex && item.type === 'customLinks') {
          return {
            ...item,
            links: [...item.links, { text: '', url: '', title: '' }],
          };
        }
        return item;
      });
      return { ...prevSettings, items: updatedItems };
    });
  };

  const removeLinkFromCustomLinksItem = (itemIndex: number, linkIndex: number) => {
    setFooterSettings(prevSettings => {
      const updatedItems = prevSettings.items.map((item, idx) => {
        if (idx === itemIndex && item.type === 'customLinks') {
          const filteredLinks = item.links.filter((_, lIdx) => lIdx !== linkIndex);
          return { ...item, links: filteredLinks };
        }
        return item;
      });
      return { ...prevSettings, items: updatedItems };
    });
  };

  const removeItem = (indexToRemove: number) => {
    setFooterSettings(prevSettings => ({
      ...prevSettings,
      items: prevSettings.items.filter((_, index) => index !== indexToRemove),
    }));
    toast.info(t('adminFooter.toastItemRemovedInfo'));
  };

  const addItem = (type: 'beian' | 'customText' | 'customLinks') => {
    let newItem: FooterItem;
    const newId = crypto.randomUUID();
    switch (type) {
        case 'beian':
            newItem = { id: newId, type: 'beian', icpBeian: '', mengIcpBeian: '', icpBeianUrl: 'https://beian.miit.gov.cn/', mengIcpBeianUrl: '#' };
            break;
        case 'customText':
            newItem = { id: newId, type: 'customText', text: '<p>新的自定义文本</p>' };
            break;
        case 'customLinks':
            newItem = { id: newId, type: 'customLinks', links: [{ text: '新链接', url: '#', title: '新链接提示' }] };
            break;
        default:
            toast.error("尝试添加无效的项目类型");
            return;
    }
    setFooterSettings(prevSettings => ({
        ...prevSettings,
        items: [...prevSettings.items, newItem],
    }));
    toast.success(t('adminFooter.toastAddItemSuccess', { type: type }));
  };

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    if (over && active.id !== over.id) {
      setFooterSettings((settings) => {
        const oldIndex = settings.items.findIndex((item) => item.id === active.id);
        const newIndex = settings.items.findIndex((item) => item.id === over.id);
        if (oldIndex === -1 || newIndex === -1) {
            console.warn("Drag and drop error: item not found for ID during reorder.");
            return settings;
        }
        return {
            ...settings,
            items: arrayMove(settings.items, oldIndex, newIndex),
        };
      });
    }
  }

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-lg">{t('adminFooter.loadingInitial')}</p>
    </div>
  );

  if (error) return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-red-600">{t('adminFooter.loadErrorTitle')}</h1>
      <p className="text-red-500">{t('adminFooter.loadErrorMessage', { error: error })}</p>
      <Button onClick={fetchFooterSettings} className="mt-4">{t('adminFooter.retryButton')}</Button>
    </div>
  );

  return (
    <div className="container mx-auto p-4 md:p-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">{t('adminFooter.titleMain')}</h1>
        <Button onClick={handleSaveChanges} disabled={isLoading} size="lg">
          {isLoading ? t('adminFooter.savingButton') : t('adminFooter.saveButton')}
        </Button>
      </div>

      {footerSettings.items.length === 0 && (
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6 text-center text-gray-500">
            {t('adminFooter.noItemsHint')}
          </CardContent>
        </Card>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={footerSettings.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
          {footerSettings.items.map((item, index) => (
            <SortableFooterItemCard 
              key={item.id}
              item={item} 
              index={index} 
              removeItem={removeItem}
              // Pass necessary handlers and t from FooterAdminPage
              renderItemForm={(item, index) => renderItemForm(item, index, handleItemFieldChange, handleCustomLinkChange, addLinkToCustomLinksItem, removeLinkFromCustomLinksItem, t)}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Card className="mt-10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{t('adminFooter.addFooterItemTitle')}</CardTitle>
          <CardDescription>{t('adminFooter.addFooterItemDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => addItem('beian')} variant="outline">
            <FiPlusCircle className="mr-2 h-4 w-4" /> {t('adminFooter.addItemButtonBeian')}
          </Button>
          <Button onClick={() => addItem('customText')} variant="outline">
            <FiPlusCircle className="mr-2 h-4 w-4" /> {t('adminFooter.addItemButtonCustomText')}
          </Button>
          <Button onClick={() => addItem('customLinks')} variant="outline">
            <FiPlusCircle className="mr-2 h-4 w-4" /> {t('adminFooter.addItemButtonCustomLinks')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}