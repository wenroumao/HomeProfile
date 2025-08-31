// AT THE VERY TOP OF app/admin/profile/page.tsx

"use client";
import { useState, useEffect, ChangeEvent, FormEvent, Suspense, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { FiPlusCircle, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useTranslation } from 'react-i18next';

// DND Kit imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Import the new SocialIconInput component
import { SocialIconInput } from '@/components/admin/SocialIconInput';

// Simple inline AdminPageTitle component
const AdminPageTitle = ({ title, description }: { title: string; description?: string }) => (
  <div className="mb-6">
    <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
    {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
  </div>
);

interface SocialLink {
  id: string; // Added for dnd-kit key
  name: string;
  url: string;
  icon: string;
}

// Updated ProfileData interface with snake_case to match API and DB
interface ProfileData {
  avatar_url?: string | null;
  introduction?: string | null;
  githubUsername?: string | null; // Added GitHub Username
  signature_svg_url1?: string | null;
  signature_svg_url2?: string | null;
  social_links?: SocialLink[] | null; // Keep SocialLink interface as is for array items
  mbti_type?: string | null; // MBTI 类型
  mbti_title?: string | null;
  mbti_image_url?: string | null; // MBTI 图片URL
  mbti_traits?: string[] | null; // MBTI 个性特质（4条）
  rss_url?: string | null;
  folo_url?: string | null; // Added for Folo link
  steam_user_id?: string | null;
  steam_api_key?: string | null;
  netease_user_id?: string | null;
  netease_music_u?: string | null;
}

// SortableItem for Social Links - Restoring this component definition
function SortableSocialLinkItem({ link, index, handleSocialLinkChange, removeSocialLink }: {
  link: SocialLink;
  index: number;
  handleSocialLinkChange: (index: number, field: keyof Omit<SocialLink, 'id'>, value: string) => void;
  removeSocialLink: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col sm:flex-row sm:items-start gap-2 p-3 border rounded-md bg-muted/50 w-full mb-2 touch-manipulation">
      <button type="button" {...attributes} {...listeners} className="p-1 cursor-grab touch-manipulation">
        <FiMoreVertical className="h-5 w-5 text-gray-500 dark:text-gray-400" />
      </button>
      {/* Name Input */}
      <div className="flex flex-col w-full sm:flex-1">
        <Input 
          type="text" 
          value={link.name} 
          onChange={(e) => handleSocialLinkChange(index, 'name', e.target.value)} 
          placeholder="名称 (如：GitHub)" 
          className="w-full"
        />
      </div>
      {/* URL Input */}
      <div className="flex flex-col w-full sm:flex-1">
        <Input 
          type="url" 
          value={link.url} 
          onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)} 
          placeholder="链接 (如：https://github.com/user)" 
          className="w-full"
        />
      </div>
      {/* Icon Input and Hint */}
      <div className="flex flex-col w-full sm:flex-1">
        <SocialIconInput
          value={link.icon}
          onChange={val => handleSocialLinkChange(index, 'icon', val)}
          // previewIconSize={22} // Default is 22 in the component, can be overridden if needed
        />
      </div>
      {/* Delete Button */}
      <div className="flex-shrink-0 self-center mt-2 sm:mt-0 sm:ml-2">
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          onClick={() => removeSocialLink(index)} 
          aria-label="移除社交链接" 
        >
          <FiTrash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export default function AdminProfilePage() {
  const { t } = useTranslation(); // Initialize useTranslation
  // Initialize state with snake_case keys and default empty/null values
  const [profile, setProfile] = useState<ProfileData>({ 
    avatar_url: '', 
    introduction: '', 
    githubUsername: '', // Added GitHub Username
    signature_svg_url1: '', 
    signature_svg_url2: '', 
    social_links: [],
    mbti_type: '',
    mbti_title: '',
    mbti_image_url: '',
    mbti_traits: ['', '', '', ''],
    rss_url: '',
    folo_url: '',
    steam_user_id: '',
    steam_api_key: '',
    netease_user_id: '',
    netease_music_u: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  // DND Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // Press and drag
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/profile');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Catch if response is not JSON
          throw new Error(errorData.message || t('adminProfile.toastFetchError'));
        }
        const data: ProfileData = await response.json();
        // Set profile state using snake_case keys, handling potential nulls from API for form fields
        setProfile({
          ...data, // Spread all data first
          avatar_url: data.avatar_url || '',
          introduction: data.introduction || '',
          githubUsername: data.githubUsername || '', // Added GitHub Username
          signature_svg_url1: data.signature_svg_url1 || '',
          signature_svg_url2: data.signature_svg_url2 || '',
          // Ensure each social link has an id for dnd-kit
          social_links: (data.social_links || []).map(link => ({ 
            ...link, 
            id: (link as any).id || crypto.randomUUID() // Add id if missing from fetched data
          })),
          mbti_type: data.mbti_type || '',
          mbti_title: data.mbti_title || '',
          mbti_image_url: data.mbti_image_url || '',
          mbti_traits: Array.isArray(data.mbti_traits) && data.mbti_traits.length === 4 ? data.mbti_traits : ['', '', '', ''],
          rss_url: data.rss_url || '',
          folo_url: data.folo_url || '',
          steam_user_id: data.steam_user_id || '',
          // steam_api_key and netease_music_u come from env, not profile data directly for saving
          steam_api_key: data.steam_api_key || '', // For display only
          netease_music_u: data.netease_music_u || '', // For display only
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t('adminProfile.toastCouldNotLoad'));
        console.error("Fetch Profile Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [t]); // Add t to dependency array

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target; // name will be snake_case (e.g., "avatar_url")
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Updated handleSocialLinkChange - field type now Omit<SocialLink, 'id'>
  const handleSocialLinkChange = (index: number, field: keyof Omit<SocialLink, 'id'>, value: string) => {
    const updatedLinks = Array.isArray(profile.social_links) ? [...profile.social_links] : [];
    if (updatedLinks[index]) {
        // Create a new object for the specific link to ensure state updates correctly
        const updatedLink = { ...updatedLinks[index], [field]: value };
        updatedLinks[index] = updatedLink;
        setProfile(prev => ({ ...prev, social_links: updatedLinks }));
    }
  };

  const addSocialLink = () => {
    const currentLinks = Array.isArray(profile.social_links) ? profile.social_links : [];
    // Add new link with a unique id
    const newLink: SocialLink = { id: crypto.randomUUID(), name: '', url: '', icon: '' };
    const updatedLinks = [...currentLinks, newLink];
    setProfile(prev => ({ ...prev, social_links: updatedLinks }));
  };

  const removeSocialLink = (index: number) => {
    const currentLinks = Array.isArray(profile.social_links) ? [...profile.social_links] : [];
    const updatedLinks = currentLinks.filter((_, i) => i !== index);
    setProfile(prev => ({ ...prev, social_links: updatedLinks }));
  };

  const handleMbtiTraitChange = (index: number, value: string) => {
    setProfile(prev => ({
      ...prev,
      mbti_traits: prev.mbti_traits ? prev.mbti_traits.map((t, i) => i === index ? value : t) : ['', '', '', ''].map((t, i) => i === index ? value : t),
    }));
  };

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    if (over && active.id !== over.id && profile.social_links) {
      const oldIndex = profile.social_links.findIndex(link => link.id === active.id);
      const newIndex = profile.social_links.findIndex(link => link.id === over.id);
      setProfile(prev => ({
        ...prev,
        social_links: arrayMove(prev.social_links!, oldIndex, newIndex)
      }));
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    // Create a type for the payload to be sent to the backend, excluding the client-side 'id' for social_links
    interface SocialLinkPayload { name: string; url: string; icon: string; }
    interface ProfilePayload extends Omit<ProfileData, 'social_links' | 'steam_api_key' | 'netease_music_u'> {
      social_links?: SocialLinkPayload[];
      // steam_api_key and netease_music_u are not sent from client for update, they are env vars handled by backend if needed
    }

    const payload: ProfilePayload = {
      avatar_url: profile.avatar_url || null,
      introduction: profile.introduction || null,
      githubUsername: profile.githubUsername || null, // Added GitHub Username
      signature_svg_url1: profile.signature_svg_url1 || null,
      signature_svg_url2: profile.signature_svg_url2 || null,
      social_links: profile.social_links && profile.social_links.length > 0 
        ? profile.social_links.map(({ id, ...rest }) => rest) // Strip id before sending
        : [], 
      mbti_type: profile.mbti_type || '',
      mbti_title: profile.mbti_title || '',
      mbti_image_url: profile.mbti_image_url || '',
      mbti_traits: Array.isArray(profile.mbti_traits) ? profile.mbti_traits.map(t => t || '') : ['', '', '', ''],
      rss_url: profile.rss_url || null,
      folo_url: profile.folo_url || null,
      steam_user_id: profile.steam_user_id || null,
      netease_user_id: profile.netease_user_id || null,
    };

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('adminProfile.toastSaveError') }));
        throw new Error(errorData.message || t('adminProfile.toastSaveError'));
      }
      toast.success(t('adminProfile.toastProfileUpdated'));
      const fetchResponse = await fetch('/api/admin/profile'); // Re-fetch after save
      if (fetchResponse.ok) {
        const updatedData: ProfileData = await fetchResponse.json();
        setProfile({
          ...updatedData,
          social_links: (updatedData.social_links || []).map(link => ({ ...link, id: (link as any).id || crypto.randomUUID() }) ),
          steam_api_key: updatedData.steam_api_key || '', // For display
          netease_music_u: updatedData.netease_music_u || '', // For display
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('adminProfile.toastCouldNotSave'));
      console.error("Submit Profile Error:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <AiOutlineLoading3Quarters className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t('adminProfile.loadingProfile')}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminPageTitle title={t('adminProfile.title')} description={t('adminProfile.description')} />
      
      <form onSubmit={handleSubmit} className="mt-6 space-y-8 max-w-5xl">
        <div>
          <label htmlFor="avatar_url" className="block text-sm font-medium text-foreground mb-1">{t('adminProfile.avatarUrlLabel')}</label>
          <Input 
            type="url" 
            name="avatar_url" 
            id="avatar_url" 
            value={profile.avatar_url || ''} 
            onChange={handleInputChange} 
            placeholder={t('adminProfile.avatarUrlPlaceholder')}
          />
        </div>

        <div>
          <label htmlFor="signature_svg_url1" className="block text-sm font-medium text-foreground mb-1">
            {t('adminProfile.signatureSvgLine1Label')}
          </label>
          <Input
            type="url"
            name="signature_svg_url1"
            id="signature_svg_url1"
            value={profile.signature_svg_url1 || ''}
            onChange={handleInputChange}
            placeholder={t('adminProfile.signatureSvgLine1Placeholder')}
            className="w-full"
          />
           <p className="text-xs text-muted-foreground mt-1">{t('adminProfile.signatureSvgLine1Description')}</p>
        </div>

        <div>
          <label htmlFor="signature_svg_url2" className="block text-sm font-medium text-foreground mb-1">
            {t('adminProfile.signatureSvgLine2Label')}
          </label>
          <Input
            type="url"
            name="signature_svg_url2"
            id="signature_svg_url2"
            value={profile.signature_svg_url2 || ''}
            onChange={handleInputChange}
            placeholder={t('adminProfile.signatureSvgLine2Placeholder')}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {t('adminProfile.signatureSvgLine2Description')}
          </p>
        </div>

        <div>
          <label htmlFor="introduction" className="block text-sm font-medium text-foreground mb-1">{t('adminProfile.introductionOptionalLabel')}</label>
          <Textarea 
            name="introduction" 
            id="introduction" 
            value={profile.introduction || ''} 
            onChange={handleInputChange} 
            rows={4}
            placeholder={t('adminProfile.introductionPlaceholder')}
          />
        </div>

        <div>
          <label htmlFor="githubUsername" className="block text-sm font-medium text-foreground mb-1">{t('adminProfile.githubUsernameLabel')}</label>
          <Input 
            type="text" 
            name="githubUsername" 
            id="githubUsername" 
            value={profile.githubUsername || ''} 
            onChange={handleInputChange} 
            placeholder={t('adminProfile.githubUsernamePlaceholder')}
          />
           <p className="text-xs text-muted-foreground mt-1">{t('adminProfile.githubUsernameDescription')}</p>
        </div>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-foreground mb-2">{t('adminProfile.socialLinksLabel')}</legend>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={profile.social_links?.map(link => link.id) || []} strategy={verticalListSortingStrategy}>
              {(profile.social_links || []).map((link, index) => (
                <SortableSocialLinkItem 
                  key={link.id} 
                  link={link} 
                  index={index} 
                  handleSocialLinkChange={handleSocialLinkChange} 
                  removeSocialLink={removeSocialLink} 
                />
              ))}
            </SortableContext>
          </DndContext>
          <Button type="button" variant="outline" onClick={addSocialLink} className="mt-2">
            <FiPlusCircle className="h-4 w-4 mr-2" /> {t('adminProfile.addSocialLinkButton')}
          </Button>
        </fieldset>

        {/* MBTI 配置区域 */}
        <fieldset className="space-y-4 border rounded-md p-4 bg-muted/50">
          <legend className="text-lg font-semibold text-foreground mb-2">{t('adminProfile.mbtiSectionTitle')}</legend>
          <div>
            <label htmlFor="mbti_type" className="block text-sm font-medium text-foreground mb-1">{t('adminProfile.mbtiTypeLabel')}</label>
            <Input
              type="text"
              name="mbti_type"
              id="mbti_type"
              value={profile.mbti_type || ''}
              onChange={handleInputChange}
              placeholder="如：ENFJ、INTP 等"
              className="w-40"
            />
          </div>
          <div>
            <label htmlFor="mbti_title" className="block text-sm font-medium text-foreground mb-1">{t('adminProfile.mbtiTitleLabel')}</label>
            <Input
              type="text"
              name="mbti_title"
              id="mbti_title"
              value={profile.mbti_title || ''}
              onChange={handleInputChange}
              placeholder="如：主人公、The Protagonist"
              className="w-60"
            />
          </div>
          <div>
            <label htmlFor="mbti_image_url" className="block text-sm font-medium text-foreground mb-1">{t('adminProfile.mbtiImageUrlLabel')}</label>
            <Input
              type="url"
              name="mbti_image_url"
              id="mbti_image_url"
              value={profile.mbti_image_url || ''}
              onChange={handleInputChange}
              placeholder="粘贴 MBTI 相关图片链接"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">{t('adminProfile.mbtiTraitsLabel')}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {profile.mbti_traits && profile.mbti_traits.map((trait, idx) => (
                <Input
                  key={idx}
                  type="text"
                  value={trait}
                  onChange={e => handleMbtiTraitChange(idx, e.target.value)}
                  placeholder={`特质 ${idx + 1}`}
                  className="w-full"
                  maxLength={32}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('adminProfile.mbtiTraitsDescription')}</p>
          </div>
        </fieldset>

        {/* RSS/Steam/网易云音乐 配置区域 */}
        <fieldset className="space-y-4 border rounded-md p-4 bg-muted/50">
          <legend className="text-lg font-semibold text-foreground mb-2">{t('adminProfile.mediaStatsTitle')}</legend>
          <div>
            <label htmlFor="rss_url" className="block text-sm font-medium text-foreground mb-1">{t('adminProfile.rssUrlLabel')}</label>
            <Input
              type="url"
              name="rss_url"
              id="rss_url"
              value={profile.rss_url || ''}
              onChange={handleInputChange}
              placeholder="如：https://yourblog.com/rss.xml"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="folo_url" className="block text-sm font-medium text-foreground mb-1">{t('adminProfile.foloUrlLabel')}</label>
            <Input
              type="url"
              name="folo_url"
              id="folo_url"
              value={profile.folo_url || ''}
              onChange={handleInputChange}
              placeholder="例如：https://app.follow.is/share/feeds/your_feed_id"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="steam_user_id" className="block text-sm font-medium text-foreground mb-1">{t('adminProfile.steamUserIdLabel')}</label>
            <Input
              type="text"
              name="steam_user_id"
              id="steam_user_id"
              value={profile.steam_user_id || ''}
              onChange={handleInputChange}
              placeholder="如：7656119..."
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="steam_api_key" className="block text-sm font-medium text-foreground mb-1">{t('adminProfile.steamApiKeyLabel')}</label>
            <Input
              type="text"
              name="steam_api_key"
              id="steam_api_key"
              value={profile.steam_api_key || ''}
              onChange={handleInputChange}
              placeholder="你的 Steam Web API Key"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="netease_user_id" className="block text-sm font-medium text-foreground mb-1">{t('adminProfile.neteaseUserIdLabel')}</label>
            <Input
              type="text"
              name="netease_user_id"
              id="netease_user_id"
              value={profile.netease_user_id || ''}
              onChange={handleInputChange}
              placeholder="如：12345678"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="netease_music_u" className="block text-sm font-medium text-foreground mb-1">{t('adminProfile.neteaseMusicULabel')}</label>
            <Input
              type="text"
              name="netease_music_u"
              id="netease_music_u"
              value={profile.netease_music_u || ''}
              onChange={handleInputChange}
              placeholder="你的网易云 MUSIC_U Cookie"
              className="w-full"
            />
          </div>
        </fieldset>

        <div className="mt-8">
          <Button type="submit" disabled={saving || loading} className="px-6">
            {saving ? (
              <><AiOutlineLoading3Quarters className="mr-2 h-4 w-4 animate-spin" />{t('adminProfile.savingProfileButton')}</>
            ) : (
              t('adminProfile.saveProfileButton')
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 