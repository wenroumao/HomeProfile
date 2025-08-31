"use client"

import { useState, useEffect, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { FiChevronLeft, FiChevronRight, FiImage, FiGithub, FiExternalLink } from "react-icons/fi";

interface Project {
  id: string
  title: string
  description: string
  imageUrl: string | null
  tags: string[]
  githubUrl?: string
  demoUrl?: string
}

// 单个项目卡片组件
function ProjectCardItem({ project }: { project: Project }) {
  const { t } = useTranslation()

  const projectTitle = project.title || t("projects.untitled", "无标题项目")
  const projectDescription = project.description || t("projects.noDescription", "暂无描述")
  
  let displayImageUrl: string | null = null
  if (typeof project.imageUrl === "string" && project.imageUrl.trim() !== "") {
    displayImageUrl = project.imageUrl
  }

  const hasGithubUrl = typeof project.githubUrl === "string" && project.githubUrl.trim() !== ""
  const hasDemoUrl = typeof project.demoUrl === "string" && project.demoUrl.trim() !== ""

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    if (target.src !== "/placeholder-error.svg") { // 避免因占位符自身404导致的循环
      target.src = "/placeholder-error.svg" 
    }
    target.onerror = null
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card/80 dark:bg-card/70">
      <div className="relative overflow-hidden aspect-[16/9] bg-muted/50 flex items-center justify-center group min-h-[220px]">
        {displayImageUrl ? (
          <img
            src={displayImageUrl} 
            alt={projectTitle}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <FiImage className="h-16 w-16 text-muted-foreground/50" />
        )}
      </div>
      <CardHeader className="pb-3 pt-5">
        <CardTitle className="text-lg font-semibold truncate text-card-foreground" title={projectTitle}>{projectTitle}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground h-10 overflow-hidden text-ellipsis line-clamp-2">
          {projectDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4 flex-grow">
        {Array.isArray(project.tags) && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {project.tags.map((tag, tagIndex) => (
              <Badge key={tagIndex} variant="secondary" className="text-xs px-1.5 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      {(hasGithubUrl || hasDemoUrl) && (
        <CardFooter className="p-4 pt-2 mt-auto">
          <div className="flex gap-1.5 items-center w-full">
            {hasGithubUrl && (
              <Button size="sm" variant="outline" asChild>
                <a
                  href={project.githubUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t("projects.githubLinkTitle") as string}
                  className="flex items-center"
                >
                  <FiGithub className="mr-1.5 h-3.5 w-3.5" />
                  GitHub
                </a>
              </Button>
            )}
            {hasDemoUrl && (
              <Button size="sm" asChild>
                <a
                  href={project.demoUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={t("projects.demoLinkTitle") as string}
                  className="flex items-center"
                >
                  <FiExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Demo
                </a>
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

export function ProjectsSection() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const autoplayOptions = {
    delay: 3000,
    stopOnInteraction: false, 
    stopOnMouseEnter: true, // Set to true to pause on hover
  };
  const emblaOptions = {
    loop: true,
    align: "center" as const,
  };
  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, [Autoplay(autoplayOptions)]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
    const autoplay = emblaApi.plugins().autoplay as any;
    if (autoplay && typeof autoplay.reset === 'function') {
      autoplay.reset(); 
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
    const autoplay = emblaApi.plugins().autoplay as any;
    if (autoplay && typeof autoplay.reset === 'function') {
      autoplay.reset(); 
    }
  }, [emblaApi]);
  
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/projects");
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Failed to get error text");
        throw new Error(`Failed to fetch projects: ${response.status} - ${errorText.substring(0, 100)}`);
      }
      const rawData = await response.json();
      const projectsArray = Array.isArray(rawData) ? rawData : (rawData && Array.isArray(rawData.data)) ? rawData.data : null;
      if (projectsArray) {
        const validatedProjects = projectsArray.map((p: any) => ({
          id: String(p.id || crypto.randomUUID()),
          title: String(p.title || t("projects.untitledApiDefault", "Untitled Project")),
          description: String(p.description || ''),
          imageUrl: (typeof p.imageUrl === 'string' && p.imageUrl.trim() !== '') ? p.imageUrl.trim() : null,
          tags: Array.isArray(p.tags) ? p.tags.map((tag: any) => String(tag)) : [],
          githubUrl: typeof p.githubUrl === 'string' && p.githubUrl.trim() !== '' ? p.githubUrl : undefined,
          demoUrl: typeof p.demoUrl === 'string' && p.demoUrl.trim() !== '' ? p.demoUrl : undefined,
        }));
        setProjects(validatedProjects);
      } else {
        setError(t("projects.fetchDataNotArray", "Project data is not in expected array format."));
        setProjects([]);
      }
    } catch (err: any) {
      setError(err.message || t("projects.fetchException", "An unexpected error occurred while loading projects."));
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (emblaApi && (!loading || projects.length === 0 || error)) {
      const timerId = setTimeout(() => {
        if (emblaApi) {
          try {
            emblaApi.reInit();
            const autoplay = emblaApi.plugins().autoplay as any;
            // With stopOnMouseEnter: true, the plugin should handle restart after hover.
            // We just ensure it plays if it was supposed to be playing initially or after other interactions.
            if (autoplay && typeof autoplay.play === 'function') {
              if(!autoplayOptions.stopOnInteraction || !autoplayOptions.stopOnMouseEnter) { // if it should generally be playing
                 if (typeof autoplay.isPlaying === 'function' && !autoplay.isPlaying()){
                    autoplay.play();
                 } else if (typeof autoplay.isPlaying !== 'function') {
                    autoplay.play();
                 }
              }
            }
          } catch (e) {
            console.error("ProjectsSection: Error in reInit timeout:", e);
          }
        }
      }, 100);
      return () => clearTimeout(timerId);
    }
  }, [emblaApi, projects, loading, error, autoplayOptions]); // Added autoplayOptions to dependency array for reInit logic

  if (loading && projects.length === 0) { return <div className="text-center py-10">Loading projects...</div>; }
  if (error) { return <div className="text-center py-10 text-red-500">Error: {error}</div>; }
  if (!loading && projects.length === 0 && !error) { return <div className="text-center py-10">No projects to display.</div>; }
  
  let visibleSlides = 1;
  if (typeof window !== 'undefined') {
    if (window.innerWidth >= 1024) { // lg breakpoint (1024px for basis-1/3)
      visibleSlides = 3;
    } else if (window.innerWidth >= 640) { // sm breakpoint (640px for basis-1/2)
      visibleSlides = 2;
    }
  }
  const showNavigationButtons = projects.length > visibleSlides;

  return (
    <div className="relative w-full mx-auto py-8">
      <div className="overflow-hidden rounded-lg p-1 mb-10" ref={emblaRef}>
        <div className="flex -ml-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex-shrink-0 flex-grow-0 basis-full sm:basis-1/2 lg:basis-1/3 p-2 min-w-0" // Adjusted for 1, 2, or 3 items
            >
              <ProjectCardItem project={project} />
            </div>
          ))}
        </div>
      </div>

      {showNavigationButtons && (
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-3">
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-background/70 hover:bg-background/90 p-2 rounded-full shadow-md"
            onClick={scrollPrev}
            aria-label={t("projects.carousel.prev") as string}
          >
            <FiChevronLeft className="h-5 w-5" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="bg-background/70 hover:bg-background/90 p-2 rounded-full shadow-md"
            onClick={scrollNext}
            aria-label={t("projects.carousel.next") as string}
          >
            <FiChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
