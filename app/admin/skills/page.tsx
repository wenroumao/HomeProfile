"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { FiPlusCircle, FiTrash2, FiMoreVertical, FiSave } from 'react-icons/fi';
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

// Interfaces based on settings.json structure
interface Skill {
  id: string; // For DND and React keys
  name: string;
  level: number;
}

interface SkillCategory {
  id: string; // For DND and React keys
  category: string;
  skills: Skill[];
}

// Simple inline AdminPageTitle component
const AdminPageTitle = ({ title, description }: { title: string; description?: string }) => (
  <div className="mb-6">
    <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
    {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
  </div>
);

// Sortable Skill Item
function SortableSkillItem({
  skill,
  categoryId,
  onNameChange,
  onLevelChange,
  onRemove,
}: {
  skill: Skill;
  categoryId: string;
  onNameChange: (name: string) => void;
  onLevelChange: (level: number) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: skill.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-3 border rounded-md bg-muted/50 touch-manipulation">
      <button type="button" {...attributes} {...listeners} className="p-1 cursor-grab touch-manipulation">
        <FiMoreVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex-grow">
        <Input
          value={skill.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t('adminSkills.skillNamePlaceholder', '技能名称')}
          className="mb-1 h-8"
        />
        <div className="flex items-center gap-2">
          <Slider
            value={[skill.level]}
            onValueChange={(value) => onLevelChange(value[0])}
            max={100}
            step={1}
            className="w-full"
          />
          <span className="text-sm text-muted-foreground w-12 text-right">{skill.level}%</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onRemove(); }} aria-label={t('adminSkills.deleteSkillAriaLabel', '删除技能')}>
        <FiTrash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

// Sortable Skill Category Item
function SortableSkillCategoryItem({
  categoryItem,
  onCategoryNameChange,
  onRemoveCategory,
  onSkillNameChange,
  onSkillLevelChange,
  onAddSkill,
  onRemoveSkill,
  onSkillOrderChange, 
}: {
  categoryItem: SkillCategory;
  onCategoryNameChange: (newName: string) => void;
  onRemoveCategory: () => void;
  onSkillNameChange: (skillId: string, newName: string) => void;
  onSkillLevelChange: (skillId: string, newLevel: number) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skillId: string) => void;
  onSkillOrderChange: (oldIndex: number, newIndex: number) => void;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: categoryItem.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 100 : undefined, // Higher zIndex for category when dragging
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEndSkills(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = categoryItem.skills.findIndex(s => s.id === active.id);
      const newIndex = categoryItem.skills.findIndex(s => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onSkillOrderChange(oldIndex, newIndex);
      }
    }
  }

  // Determine the translation key to use
  const translationKey = categoryItem.category;

  // Hardcode English for specific Chinese categories as requested
  let displayCategoryName = categoryItem.category; // 默认直接用原始

  switch (categoryItem.category) {
    case '前端':
      displayCategoryName = 'Frontend';
      break;
    case '后端':
      displayCategoryName = 'Backend';
      break;
    case '数据库':
      displayCategoryName = 'Database';
      break;
    case '其他':
      displayCategoryName = 'Other';
      break;
    // 其他硬编码
    default:
      // 直接用原始，不再调用 t()
      displayCategoryName = categoryItem.category;
  }

  return (
    <div ref={setNodeRef} style={style} className="p-6 border rounded-lg shadow-sm bg-card touch-manipulation">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center flex-grow">
          <button type="button" {...attributes} {...listeners} className="p-1 cursor-grab mr-2 touch-manipulation">
            <FiMoreVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <Input
            value={displayCategoryName}
            onChange={(e) => onCategoryNameChange(e.target.value)}
            className="text-xl font-semibold border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto flex-grow"
            placeholder={t('adminSkills.categoryNamePlaceholder', '分类名称')}
          />
        </div>
        <Button variant="ghost" size="icon" onClick={onRemoveCategory} aria-label={t('adminSkills.deleteCategoryAriaLabel', '删除分类')}>
          <FiTrash2 className="h-5 w-5 text-destructive" />
        </Button>
      </div>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndSkills}>
        <SortableContext items={categoryItem.skills.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 mb-4">
            {categoryItem.skills.map((skill) => (
              <SortableSkillItem
                key={skill.id}
                skill={skill}
                categoryId={categoryItem.id}
                onNameChange={(name) => onSkillNameChange(skill.id, name)}
                onLevelChange={(level) => onSkillLevelChange(skill.id, level)}
                onRemove={() => onRemoveSkill(skill.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button variant="outline" size="sm" onClick={onAddSkill}>
        <FiPlusCircle className="mr-2 h-4 w-4" />
        {t('adminSkills.addSkillButton', '添加技能到此分类')}
      </Button>
    </div>
  );
}


export default function AdminSkillsPage() {
  const { t } = useTranslation();
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }), // Require a 10px drag to start category drag
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/skills');
        if (!response.ok) {
          throw new Error(t('adminSkills.toastFetchError'));
        }
        const data = await response.json();
        const categoriesWithIds = (Array.isArray(data) ? data : []).map((cat: Omit<SkillCategory, 'id'>) => ({
          ...cat,
          id: crypto.randomUUID(),
          skills: Array.isArray(cat.skills) ? cat.skills.map((skill: Omit<Skill, 'id'>) => ({
            ...skill,
            id: crypto.randomUUID(),
          })) : [],
        }));
        setSkillCategories(categoriesWithIds);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t('adminSkills.toastCouldNotLoad'));
        console.error("Fetch Skills Error:", error);
        setSkillCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const handleSaveSkills = async () => {
    console.log("handleSaveSkills CALLED. Current saving state:", saving, "Current loading state:", loading);
    console.trace(); // Log the call stack
    setSaving(true);
    const payload = skillCategories.map(({ id, skills, ...restCategory }) => ({
      ...restCategory,
      skills: skills.map(({ id: skillId, ...restSkill }) => restSkill),
    }));
    try {
      const response = await fetch('/api/admin/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || t('adminSkills.toastSaveError'));
      }
      console.log("BEFORE toast.success in handleSaveSkills");
      toast.success(t('adminSkills.toastSkillsUpdated'));
      console.log("AFTER toast.success in handleSaveSkills");
    } catch (error) {
      console.log("ERROR in handleSaveSkills catch block");
      toast.error(error instanceof Error ? error.message : t('adminSkills.toastCouldNotSave'));
      console.error("Save Skills Error:", error);
    } finally {
      console.log("FINALLY block in handleSaveSkills, setting saving to false");
      setSaving(false);
    }
  };

  const handleCategoryNameChange = (categoryId: string, newName: string) => {
    setSkillCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, category: newName } : cat));
  };

  const handleSkillChange = (categoryId: string, skillId: string, field: 'name' | 'level', value: string | number) => {
    setSkillCategories(prev => prev.map(cat => 
      cat.id === categoryId ? {
        ...cat,
        skills: cat.skills.map(skill => 
          skill.id === skillId ? { ...skill, [field]: value } : skill
        )
      } : cat
    ));
  };

  const addCategory = () => {
    const newCategory: SkillCategory = {
      id: crypto.randomUUID(),
      category: t('adminSkills.newCategoryDefaultName', '新分类'),
      skills: [],
    };
    setSkillCategories(prev => [...prev, newCategory]);
  };

  const removeCategory = (categoryId: string) => {
    setSkillCategories(prev => prev.filter(cat => cat.id !== categoryId));
    toast.warning(t('adminSkills.categoryRemovedWarning'));
  };

  const addSkillToCategory = (categoryId: string) => {
    const newSkill: Skill = {
      id: crypto.randomUUID(),
      name: t('adminSkills.newSkillDefaultName', ''),
      level: 50,
    };
    setSkillCategories(prev => prev.map(cat => 
      cat.id === categoryId ? { ...cat, skills: [...cat.skills, newSkill] } : cat
    ));
  };

  const removeSkill = (categoryId: string, skillId: string) => {
    setSkillCategories(prev => prev.map(cat => 
      cat.id === categoryId ? {
        ...cat,
        skills: cat.skills.filter(skill => skill.id !== skillId)
      } : cat
    ));
    toast.warning(t('adminSkills.skillRemovedWarning'));
  };

  function handleDragEndCategories(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSkillCategories((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }
  
  const handleSkillOrderChange = (categoryId: string, oldIndex: number, newIndex: number) => {
    setSkillCategories(prev => prev.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          skills: arrayMove(cat.skills, oldIndex, newIndex),
        };
      }
      return cat;
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('adminSkills.loadingSkills')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminPageTitle title={t('adminSkills.title', '技能管理')} description={t('adminSkills.description', '管理您的技能分类和各项技能的熟练度。')} />

      <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCategories}>
        <SortableContext items={skillCategories.map(cat => cat.id)} strategy={verticalListSortingStrategy}>
          <div className="mt-6 space-y-6">
            {skillCategories.map((categoryItem) => (
              <SortableSkillCategoryItem
                key={categoryItem.id}
                categoryItem={categoryItem}
                onCategoryNameChange={(newName) => handleCategoryNameChange(categoryItem.id, newName)}
                onRemoveCategory={() => removeCategory(categoryItem.id)}
                onAddSkill={() => addSkillToCategory(categoryItem.id)}
                onSkillNameChange={(skillId, newName) => handleSkillChange(categoryItem.id, skillId, 'name', newName)}
                onSkillLevelChange={(skillId, newLevel) => handleSkillChange(categoryItem.id, skillId, 'level', newLevel)}
                onRemoveSkill={(skillId) => removeSkill(categoryItem.id, skillId)}
                onSkillOrderChange={(oldIndex, newIndex) => handleSkillOrderChange(categoryItem.id, oldIndex, newIndex)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button variant="outline" onClick={addCategory} className="mt-8">
        <FiPlusCircle className="mr-2 h-4 w-4" />
        {t('adminSkills.addCategoryButton', '添加新分类')}
      </Button>

      <div className="mt-10 flex justify-end">
        <Button onClick={handleSaveSkills} disabled={saving || loading} className="px-6">
          {saving ? (
            <><AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />{t('adminProfile.savingProfileButton')}</>
          ) : (
            <><FiSave className="mr-2 h-4 w-4" /> {t('adminSkills.saveSkillsButton', '保存技能')}</>
          )}
        </Button>
      </div>
    </div>
  );
} 