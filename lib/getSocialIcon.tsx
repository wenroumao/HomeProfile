"use client";

import { useState, useEffect, Suspense } from 'react';
import { AiOutlineLoading3Quarters } from "react-icons/ai";

// Removed simpleIconsList and simpleIconsMap

// Define a map for brand colors for specific Simple Icons
const simpleIconBrandColors: { [key: string]: string } = {
  SiTencentqq: '#12B7F5',
  SiNeteasecloudmusic: '#DE2F2F',
  SiBilibili: '#00A1D6',
  // Add more Si* icons and their brand colors here if needed
  // e.g., SiWechat: '#07C160',
};

// ReactIconsLoader component remains largely the same, 
// its 'lu' and 'si' cases will now be the primary way to load Lucide and Simple Icons.
const ReactIconsLoader = ({ lib, iconName, iconSize, color, className }: { lib: string; iconName: string; iconSize: number; color?: string; className?: string }) => {
  const [LoadedIcon, setLoadedIcon] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    const loadIconAsync = async () => {
      if (!lib || !iconName) {
        setLoadedIcon(null);
        return;
      }
      let iconModule: any = null;
      const lowerLib = lib.toLowerCase();
      try {
        switch (lowerLib) {
          case 'fa': iconModule = await import('react-icons/fa'); break;
          case 'md': iconModule = await import('react-icons/md'); break;
          case 'ai': iconModule = await import('react-icons/ai'); break;
          case 'bs': iconModule = await import('react-icons/bs'); break;
          case 'bi': iconModule = await import('react-icons/bi'); break; 
          case 'bxl': iconModule = await import('react-icons/bi'); break;
          case 'bxs': iconModule = await import('react-icons/bi'); break;
          case 'di': iconModule = await import('react-icons/di'); break;
          case 'fi': iconModule = await import('react-icons/fi'); break;
          case 'fc': iconModule = await import('react-icons/fc'); break;
          case 'gi': iconModule = await import('react-icons/gi'); break;
          case 'go': iconModule = await import('react-icons/go'); break;
          case 'gr': iconModule = await import('react-icons/gr'); break;
          case 'hi': iconModule = await import('react-icons/hi'); break;
          case 'hi2': iconModule = await import('react-icons/hi2'); break;
          case 'im': iconModule = await import('react-icons/im'); break;
          case 'io': iconModule = await import('react-icons/io'); break;
          case 'io5': 
            // Special handling for the linter-suggested name for IoLogoGithub
            if (iconName === "IoLogoGithub") {
                iconModule = await import('react-icons/io5');
            } else {
                iconModule = await import('react-icons/io5'); 
            }
            break;
          case 'lia': iconModule = await import('react-icons/lia'); break;
          case 'lu': iconModule = await import('react-icons/lu'); break; // Lucide Icons from react-icons
          case 'pi': iconModule = await import('react-icons/pi'); break;
          case 'ri': iconModule = await import('react-icons/ri'); break;
          case 'rx': iconModule = await import('react-icons/rx'); break;
          case 'si': iconModule = await import('react-icons/si'); break; // Simple Icons from react-icons
          case 'sl': iconModule = await import('react-icons/sl'); break;
          case 'tb': iconModule = await import('react-icons/tb'); break;
          case 'tfi': iconModule = await import('react-icons/tfi'); break;
          case 'ti': iconModule = await import('react-icons/ti'); break;
          case 'vsc': iconModule = await import('react-icons/vsc'); break;
          case 'wi': iconModule = await import('react-icons/wi'); break;
          case 'cg': iconModule = await import('react-icons/cg'); break;
          default:
            console.warn(`[ReactIconsLoader] Library prefix \"${lowerLib}\" is not handled.`);
            setLoadedIcon(null);
            return;
        }
        // For IoLogoGithub, use the linter-suggested name directly from the possibly already loaded module
        const iconToActuallyLoad = (lowerLib === 'io5' && iconName === 'Io5LogoGithub') ? 'IoLogoGithub' : iconName;

        const FoundIcon = iconModule?.[iconToActuallyLoad] || (iconModule?.default as any)?.[iconToActuallyLoad];
        if (FoundIcon) {
          setLoadedIcon(() => FoundIcon); // Store the component type itself
        } else {
          console.warn(`[ReactIconsLoader] Icon \"${iconToActuallyLoad}\" (attempted for \"${iconName}\") not found in \"${lowerLib}\".`);
          setLoadedIcon(null);
        }
      } catch (error) {
        console.error(`[ReactIconsLoader] Failed to import \"${lowerLib}\" or find \"${iconName}\":`, error);
        setLoadedIcon(null);
      }
    };
    loadIconAsync();
  }, [lib, iconName]);

  if (LoadedIcon) {
    const props: any = { size: iconSize };
    if (color) {
      props.color = color;
    }
    if (className) {
      props.className = className;
    }
    return <LoadedIcon {...props} />;
  }
  return null; 
};

export function getSocialIconComponent(iconName: string, iconSize: number = 20, className?: string) {
  let explicitColor: string | undefined = undefined;

  if (!iconName || typeof iconName !== 'string') {
    return (
      <Suspense fallback={<AiOutlineLoading3Quarters size={iconSize} className='animate-spin text-muted-foreground'/>}>
        <ReactIconsLoader lib="fi" iconName="FiHelpCircle" iconSize={iconSize} className={className} />
      </Suspense>
    );
  }

  let libToLoad: string | null = null;
  let iconToLoad: string = iconName;

  if (iconName.match(/^(lucide[-_]?)/i)) {
    libToLoad = 'lu';
    iconToLoad = 'Lu' + iconName.replace(/^(lucide[-_]?)/i, '').replace(/^./, (c) => c.toUpperCase());
    iconToLoad = iconToLoad.replace(/[-_](.)/g, (_, c) => c.toUpperCase());
  }
  else if (iconName.startsWith('si-')) {
    libToLoad = 'si';
    iconToLoad = 'Si' + iconName.substring(3).replace(/^./, (c) => c.toUpperCase());
    iconToLoad = iconToLoad.replace(/[-_](.)/g, (_, c) => c.toUpperCase());
    if (simpleIconBrandColors[iconToLoad]) {
      explicitColor = simpleIconBrandColors[iconToLoad];
    }
  }
  else {
    const reactIconMatch = iconName.match(/^([A-Z][a-z0-9]*|[A-Z]{2,}|[A-Z][a-z]+[A-Z0-9_]*)([A-Z0-9].*)$/);
    if (reactIconMatch && reactIconMatch[1]) {
      libToLoad = reactIconMatch[1].toLowerCase();
      // If the input was Io5LogoGithub, and the lib is io5, we should try to load IoLogoGithub
      if (libToLoad === 'io5' && iconName === "Io5LogoGithub"){
        iconToLoad = "IoLogoGithub";
      } else {
        iconToLoad = iconName;
      }
      
      // If it's a Simple Icon (lib 'si') and has a defined brand color, use it.
      if (libToLoad === 'si' && simpleIconBrandColors[iconName]) {
        explicitColor = simpleIconBrandColors[iconName];
      }
    }
  }

  if (libToLoad) {
    return (
      <Suspense fallback={<AiOutlineLoading3Quarters size={iconSize} className='animate-spin text-muted-foreground'/>}>
        <ReactIconsLoader lib={libToLoad} iconName={iconToLoad} iconSize={iconSize} color={explicitColor} className={className} />
      </Suspense>
    );
  }

  console.warn(`[getSocialIconComponent] Could not determine library for icon: "${iconName}". Falling back.`);
  return (
    <Suspense fallback={<AiOutlineLoading3Quarters size={iconSize} className='animate-spin text-muted-foreground'/>}>
      <ReactIconsLoader lib="fi" iconName="FiExternalLink" iconSize={iconSize} className={className} />
    </Suspense>
  );
}