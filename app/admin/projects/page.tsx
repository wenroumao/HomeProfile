"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox'; // Added for bulk selection
import { toast } from 'sonner';
import { FiPlusCircle, FiTrash2, FiMoreVertical, FiSave, FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useTranslation } from 'react-i18next';

// DND Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Project Interface
interface Project {
  id: string; // Client-side unique ID for DND Kit and React keys, will be generated if not from API
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  githubUrl?: string;
  demoUrl?: string;
  isPinned?: boolean;
  status?: "published" | "draft" | "archived";
  category?: string;
  priority?: number;
  startDate?: string;
  endDate?: string;
}

// Validation error types
interface ProjectValidationError {
  title?: string;
  imageUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
}

interface AllValidationErrors {
  [projectId: string]: ProjectValidationError;
}

// Helper for URL validation (basic)
const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Allow empty URLs if optional
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

// Sortable Project Item Component
function SortableProjectItem({
  project,
  onRemove,
  onFieldChange,
  onTagsChange,
  isSelected,
  onSelectionChange,
  validationError
}: {
  project: Project;
  onRemove: () => void;
  onFieldChange: (fieldName: keyof Omit<Project, 'id' | 'tags'>, value: string) => void;
  onTagsChange: (tags: string[]) => void;
  isSelected: boolean;
  onSelectionChange: (selected: boolean) => void;
  validationError?: ProjectValidationError;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
  const [tagInputValue, setTagInputValue] = useState('');
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 10 : undefined,
    border: validationError && Object.keys(validationError).length > 0 ? '1px solid red' : undefined, // Highlight if errors
  };

  const handleAddTag = () => {
    const newTag = tagInputValue.trim();
    if (newTag && !project.tags.includes(newTag)) {
      onTagsChange([...project.tags, newTag]);
    }
    setTagInputValue('');
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Backspace' && tagInputValue === '' && project.tags.length > 0) {
      onTagsChange(project.tags.slice(0, -1));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(project.tags.filter(tag => tag !== tagToRemove));
  };

  const renderError = (fieldError?: string) => {
    if (!fieldError) return null;
    return <p className="text-xs text-red-500 mt-1 flex items-center"><FiAlertCircle className="h-3 w-3 mr-1" />{fieldError}</p>;
  };

  return (
    <div id={`project-item-${project.id}`} ref={setNodeRef} style={style} className="p-4 border rounded-lg shadow-sm bg-card touch-manipulation relative">
      {isDragging && <div className="absolute inset-0 bg-primary/10 z-0"></div>}
      <div className="flex items-start space-x-3 relative z-10">
        <Checkbox
          id={`select-${project.id}`}
          checked={isSelected}
          onCheckedChange={(checked) => onSelectionChange(Boolean(checked))}
          className="mt-2.5"
          aria-label={t('adminProjects.selectProjectAriaLabel', `选择项目 ${project.title}`)}
        />
        <div className="flex-grow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center flex-grow">
                <button type="button" {...attributes} {...listeners} className="p-1 cursor-grab mr-2 touch-manipulation">
                    <FiMoreVertical className="h-5 w-5 text-muted-foreground" />
                </button>
                <Input 
                    value={project.title} 
                    onChange={(e) => onFieldChange('title', e.target.value)}
                    placeholder={t('adminProjects.titlePlaceholder', '项目标题')}
                    className={`text-lg font-semibold ${validationError?.title ? 'border-red-500' : ''}`}
                />
            </div>
            <Button variant="ghost" size="icon" onClick={onRemove} className="text-red-500 hover:text-red-600">
                <FiTrash2 className="h-5 w-5" />
            </Button>
          </div>
          {renderError(validationError?.title)}
          
          <div className="space-y-3">
            <div>
                <label htmlFor={`desc-${project.id}`} className="block text-sm font-medium text-muted-foreground mb-1">{t('adminProjects.descriptionLabel', '描述')}</label>
                <Textarea 
                    id={`desc-${project.id}`}
                    value={project.description}
                    onChange={(e) => onFieldChange('description', e.target.value)}
                    placeholder={t('adminProjects.descriptionPlaceholder', '项目描述...')}
                    className="min-h-[60px]"
                />
            </div>
            <div>
                <label htmlFor={`imageUrl-${project.id}`} className="block text-sm font-medium text-muted-foreground mb-1">{t('adminProjects.imageUrlLabel', '图片URL')}</label>
                <Input 
                    id={`imageUrl-${project.id}`}
                    value={project.imageUrl}
                    onChange={(e) => onFieldChange('imageUrl', e.target.value)}
                    placeholder={t('adminProjects.imageUrlPlaceholder', '/images/my-project.png')}
                    className={validationError?.imageUrl ? 'border-red-500' : ''}
                />
                {renderError(validationError?.imageUrl)}
            </div>
            <div>
                <label htmlFor={`tags-${project.id}`} className="block text-sm font-medium text-muted-foreground mb-1">{t('adminProjects.tagsLabel', '标签')}</label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {project.tags.map(tag => (
                        <span key={tag} className="flex items-center px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-xs">
                            {tag}
                            <button 
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 text-muted-foreground hover:text-destructive focus:outline-none"
                                aria-label={t('adminProjects.removeTagAriaLabel', `移除标签 ${tag}`)}
                            >
                                <FiXCircle className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
                <Input 
                    id={`tags-${project.id}`}
                    value={tagInputValue}
                    onChange={(e) => setTagInputValue(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder={t('adminProjects.tagsPlaceholder', '添加标签后按回车')}
                />
            </div>
            <div>
                <label htmlFor={`githubUrl-${project.id}`} className="block text-sm font-medium text-muted-foreground mb-1">{t('adminProjects.githubUrlLabel', 'GitHub链接 (可选)')}</label>
                <Input 
                    id={`githubUrl-${project.id}`}
                    value={project.githubUrl || ''}
                    onChange={(e) => onFieldChange('githubUrl', e.target.value)}
                    placeholder={t('adminProjects.githubUrlPlaceholder', 'https://github.com/user/project')}
                    className={validationError?.githubUrl ? 'border-red-500' : ''}
                />
                {renderError(validationError?.githubUrl)}
            </div>
            <div>
                <label htmlFor={`demoUrl-${project.id}`} className="block text-sm font-medium text-muted-foreground mb-1">{t('adminProjects.demoUrlLabel', '演示链接 (可选)')}</label>
                <Input 
                    id={`demoUrl-${project.id}`}
                    value={project.demoUrl || ''}
                    onChange={(e) => onFieldChange('demoUrl', e.target.value)}
                    placeholder={t('adminProjects.demoUrlPlaceholder', 'https://project.example.com')}
                    className={validationError?.demoUrl ? 'border-red-500' : ''}
                />
                {renderError(validationError?.demoUrl)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function AdminProjectsPage() {
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<Set<string>>(new Set());
  const [validationErrors, setValidationErrors] = useState<AllValidationErrors>({});
  const [justAddedProjectId, setJustAddedProjectId] = useState<string | null>(null);

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/projects');
      if (!response.ok) {
        throw new Error(t('adminProjects.toastFetchError', '获取项目数据失败'));
      }
      const data = await response.json();
      setProjects(data.map((p: any) => ({ ...p, id: p.id || crypto.randomUUID() }))); // Ensure client ID
      toast.success(t('adminProjects.toastProjectsLoaded', '项目数据已加载'));
    } catch (error: any) {
      toast.error(error.message || t('adminProjects.toastFetchErrorGeneric', '加载项目时出错'));
      setProjects([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (justAddedProjectId) {
      console.log(`Attempting to scroll to new project with id: ${justAddedProjectId}`);
      const element = document.getElementById(`project-item-${justAddedProjectId}`);
      if (element) {
        console.log(`Element found, scrolling into view:`, element);
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setJustAddedProjectId(null);
      } else {
        console.warn(`Element with id project-item-${justAddedProjectId} not found for scrolling.`);
      }
    }
  }, [justAddedProjectId, projects]);

  const validateProject = useCallback((project: Project): ProjectValidationError => {
    const errors: ProjectValidationError = {};
    if (!project.title.trim()) {
      errors.title = t('adminProjects.validation.titleRequired', '项目标题不能为空');
    }
    if (!project.imageUrl.trim()) {
      errors.imageUrl = t('adminProjects.validation.imageUrlRequired', '图片URL不能为空');
    } else if (!isValidUrl(project.imageUrl) && !project.imageUrl.startsWith('/')) { // Allow relative paths starting with /
      errors.imageUrl = t('adminProjects.validation.imageUrlInvalid', '图片URL格式无效');
    }
    if (project.githubUrl && !isValidUrl(project.githubUrl)) {
      errors.githubUrl = t('adminProjects.validation.githubUrlInvalid', 'GitHub链接格式无效');
    }
    if (project.demoUrl && !isValidUrl(project.demoUrl)) {
      errors.demoUrl = t('adminProjects.validation.demoUrlInvalid', '演示链接格式无效');
    }
    return errors;
  }, [t]);

  const validateAllProjects = useCallback(() => {
    const allErrors: AllValidationErrors = {};
    let hasAnyError = false;
    projects.forEach(p => {
      const projectErrors = validateProject(p);
      if (Object.keys(projectErrors).length > 0) {
        allErrors[p.id] = projectErrors;
        hasAnyError = true;
      }
    });
    setValidationErrors(allErrors);
    return !hasAnyError;
  }, [projects, validateProject]);

  const handleSaveProjects = async () => {
    if (!validateAllProjects()) {
      toast.error(t('adminProjects.toastValidationFailed', '请修正表单中的错误后再保存。'));
      return;
    }
    setSaving(true);
    try {
      // Remove client-side only 'id' if your API doesn't expect/handle it or generates its own.
      // For now, our API is simple and will just store what it gets.
      const payload = projects; 
      const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t('adminProjects.toastSaveError', '保存项目失败'));
      }
      toast.success(t('adminProjects.toastProjectsSaved', '项目已成功保存！'));
      setValidationErrors({}); // Clear errors on successful save
    } catch (error: any) {
      toast.error(error.message || t('adminProjects.toastCouldNotSave', '无法保存项目。'));
    } finally {
      setSaving(false);
    }
  };
  
  const handleAddProject = () => {
    console.log("handleAddProject called");
    const newProjectId = `new_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    const newProject: Project = {
      id: newProjectId,
      title: t("adminProjects.newProjectTitle", "新项目"),
      description: "",
      imageUrl: "/images/vapo.gif",
      tags: [],
      githubUrl: "",
      demoUrl: "",
      isPinned: false,
      status: "published",
      category: "",
      priority: projects.length > 0 
                ? Math.max(...projects.map(p => p.priority || 0).filter(p => typeof p === 'number'), 0) + 1 
                : 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
    };
    setProjects((prevProjects) => [...prevProjects, newProject]);
    setJustAddedProjectId(newProjectId);
    console.log("New project added to the end of the list:", newProject);
  };

  const handleIndividualRemoveProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setSelectedProjectIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(projectId);
      return newSet;
    });
    setValidationErrors(prev => {
      const newErrors = {...prev};
      delete newErrors[projectId];
      return newErrors;
    });
    toast.warning(t('adminProjects.toastProjectRemovedWarn', '项目已移除。'));
  };

  const handleProjectFieldChange = (projectId: string, fieldName: keyof Omit<Project, 'id' | 'tags'>, value: string) => {
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.id === projectId ? { ...p, [fieldName]: value } : p
      )
    );
    // Optionally, re-validate on change
    // const changedProject = projects.find(p => p.id === projectId);
    // if (changedProject) {
    //   const projectErrors = validateProject({ ...changedProject, [fieldName]: value });
    //   setValidationErrors(prev => ({ ...prev, [projectId]: projectErrors }));
    // }
  };

  const handleProjectTagsChange = (projectId: string, newTags: string[]) => {
    setProjects(prevProjects => 
      prevProjects.map(p => 
        p.id === projectId ? { ...p, tags: newTags } : p
      )
    );
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setProjects((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  // Bulk operations
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjectIds(new Set(projects.map(p => p.id)));
    } else {
      setSelectedProjectIds(new Set());
    }
  };

  const handleProjectSelectionChange = (projectId: string, selected: boolean) => {
    setSelectedProjectIds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(projectId);
      } else {
        newSet.delete(projectId);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedProjectIds.size === 0) {
      toast.info(t('adminProjects.toastNoProjectsSelected', '没有选中任何项目。'));
      return;
    }
    setProjects(prev => prev.filter(p => !selectedProjectIds.has(p.id)));
    const remainingErrors: AllValidationErrors = {};
    Object.keys(validationErrors).forEach(id => {
      if (!selectedProjectIds.has(id)) {
        remainingErrors[id] = validationErrors[id];
      }
    });
    setValidationErrors(remainingErrors);
    setSelectedProjectIds(new Set());
    toast.warning(t('adminProjects.toastSelectedProjectsRemoved', `${selectedProjectIds.size} 个项目已被移除。`));
  };

  const isAllSelected = projects.length > 0 && selectedProjectIds.size === projects.length;

  if (loading && projects.length === 0) { // Show full page loader only on initial load
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <AiOutlineLoading3Quarters className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-lg">{t('adminProjects.loadingProjectsInitial', '正在加载项目数据...')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">{t('adminProjects.titleMain', '项目管理中心')}</h1>
            <p className="text-base text-muted-foreground mt-1.5">{t('adminProjects.descriptionMain', '在此处添加、编辑、排序和管理您的所有项目。')}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
            <Button onClick={handleAddProject} variant="outline">
                <FiPlusCircle className="mr-2 h-4 w-4" />
                {t('adminProjects.addProjectButton', '添加新项目')}
            </Button>
            <Button onClick={handleSaveProjects} disabled={saving || loading}>
            {saving ? (
                <><AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />{t('adminProjects.savingButton', '正在保存...')}</>
            ) : (
                <><FiSave className="mr-2 h-4 w-4" />{t('adminProjects.saveButton', '保存更改')}</>
            )}
            </Button>
        </div>
      </header>

      {projects.length > 0 && (
        <div className="mb-4 flex items-center gap-4 p-3 bg-muted/50 rounded-lg border">
            <Checkbox 
                id="selectAll"
                checked={isAllSelected}
                onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                aria-label={t('adminProjects.selectAllAriaLabel', '全选/取消全选所有项目')}
            />
            <label htmlFor="selectAll" className="text-sm font-medium cursor-pointer select-none">
                {isAllSelected ? t('adminProjects.deselectAll', '取消全选') : t('adminProjects.selectAll', '全选')}
            </label>
            {selectedProjectIds.size > 0 && (
                <Button onClick={handleDeleteSelected} variant="destructive" size="sm">
                    <FiTrash2 className="mr-2 h-4 w-4" />
                    {t('adminProjects.deleteSelectedButton', `删除选中的 (${selectedProjectIds.size}) 项`)}
                </Button>
            )}
        </div>
      )}

      {loading && projects.length > 0 && (
         <div className="my-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 flex items-center">
            <AiOutlineLoading3Quarters className="h-4 w-4 animate-spin mr-2" />
            {t('adminProjects.loadingProjectsUpdate', '正在后台更新项目数据...')}
        </div>
      )}

      <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-5"> 
            {projects.map((project) => (
              <SortableProjectItem
                key={project.id}
                project={project}
                onRemove={() => handleIndividualRemoveProject(project.id)}
                onFieldChange={(fieldName, value) => handleProjectFieldChange(project.id, fieldName, value)}
                onTagsChange={(newTags) => handleProjectTagsChange(project.id, newTags)}
                isSelected={selectedProjectIds.has(project.id)}
                onSelectionChange={(selected) => handleProjectSelectionChange(project.id, selected)}
                validationError={validationErrors[project.id]}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {projects.length === 0 && !loading && (
        <div className="text-center text-muted-foreground py-12">
            <FiCheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" /> 
            <p className="text-lg mb-1">{t('adminProjects.noProjectsFoundMain', '还没有项目哦！')}</p>
            <p className="text-sm mb-4">{t('adminProjects.noProjectsFoundSub', '点击"添加新项目"按钮来创建您的第一个项目吧。')}</p>
            <Button onClick={handleAddProject} size="lg">
                <FiPlusCircle className="mr-2 h-5 w-5" />
                {t('adminProjects.addFirstProjectButton', '添加第一个项目')}
            </Button>
        </div>
      )}
    </div>
  );
} 