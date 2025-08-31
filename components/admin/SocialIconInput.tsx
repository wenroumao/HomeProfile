"use client";

import { useState, useEffect, ChangeEvent, FormEvent, Suspense, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FiHelpCircle } from 'react-icons/fi'; // Changed to react-icons
import { getSocialIconComponent } from '@/lib/getSocialIcon'; // Adjusted path

// Define an even more expanded list of representative React Icons names for suggestions
// UPDATED LIST: Attempting to conform to react-icons naming (Lu, Si, Fa, Md, etc. prefixes)
const representativeReactIcons = [
  // Font Awesome (fa)
  "FaGithub", "FaTwitter", "FaLinkedin", "FaInstagram", "FaYoutube", "FaEnvelope", "FaLink", "FaDiscord", "FaReddit", "FaWhatsapp",
  "FaRss", "FaRssSquare", "FaBlog", "FaPen", "FaEdit", "FaFileAlt", "FaFileSignature", "FaBookOpen", "FaCommentDots", "FaComments", 
  "FaThumbsUp", "FaThumbsDown", "FaSearch", "FaUserCircle", "FaUserFriends", "FaUsers", "FaCog", "FaCogs", "FaHome", "FaPlusCircle", "FaMinusCircle",
  "FaExternalLinkAlt", "FaShareAlt", "FaArchive", "FaImage", "FaImages", "FaFolderOpen", "FaFolder", "FaTag", "FaTags", "FaCalendarAlt",
  "FaMapMarkerAlt", "FaInfoCircle", "FaQuestionCircle", "FaExclamationTriangle", "FaCheckCircle", "FaTimesCircle", "FaSpinner", "FaQuoteLeft", "FaQuoteRight",
  "FaCode", "FaTerminal", "FaDatabase", "FaServer", "FaCloudUploadAlt", "FaCloudDownloadAlt", "FaDesktop", "FaMobileAlt", "FaTabletAlt", "FaSave", "FaPrint",

  // Material Design (md)
  "MdSettings", "MdHome", "MdAlarm", "MdEmail", "MdLink", "MdSearch", "MdInfo", "MdInfoOutline", "MdBuild", "MdFavorite", "MdFavoriteBorder",
  "MdCloud", "MdCloudUpload", "MdCloudDownload", "MdArticle", "MdRssFeed", "MdEditNote", "MdPostAdd", "MdRateReview", "MdComment", "MdThumbUp", 
  "MdThumbDown", "MdBook", "MdShare", "MdImage", "MdPhotoLibrary", "MdDashboard", "MdAccountCircle", "MdGroup", "MdAdminPanelSettings",
  "MdSettingsInputComponent", "MdAddLink", "MdRemoveRedEye", "MdVisibilityOff", "MdAnalytics", "MdPhotoCamera", "MdVideocam", "MdMenuBook",
  "MdFolder", "MdFolderOpen", "MdLabel", "MdNewLabel", "MdEvent", "MdPlace", "MdHelpOutline", "MdErrorOutline", "MdWarningAmber", "MdCheckCircleOutline",
  "MdCancel", "MdHourglassEmpty", "MdCached", "MdFormatQuote", "MdCode", "MdTerminal", "MdStorage", "MdDns", "MdSave", "MdPrint", "MdLogout", "MdLogin",

  // Ionicons (io) - Corrected from Io5 based on linter feedback for Io5LogoGithub
  "IoLogoGithub", "IoLogoTwitter", "IoLogoLinkedin", "IoLogoFacebook", "IoLogoInstagram", "IoLogoYoutube", "IoMail", "IoLink", "IoSearch", 
  "IoChatbubbles", "IoSettingsSharp", "IoHome", "IoCloud", "IoCloudUploadOutline", "IoCloudDownloadOutline", "IoRss", "IoCreateOutline", 
  "IoDocumentTextOutline", "IoNewspaperOutline", "IoBookOutline", "IoShareSocialOutline", "IoImageOutline", "IoImagesOutline", 
  "IoThumbsUpOutline", "IoThumbsDownOutline", "IoPeopleCircleOutline", "IoPeopleOutline", "IoFolderOpenOutline", "IoFolderOutline", 
  "IoPricetagOutline", "IoPricetagsOutline", "IoCalendarClearOutline", "IoLocationOutline", "IoInformationCircleOutline", "IoAlertCircleOutline", 
  "IoCheckmarkCircleOutline", "IoCloseCircleOutline", "IoSyncCircleOutline", "IoQuoteOutline", "IoCodeSlashOutline", "IoTerminalOutline", 
  "IoSaveOutline", "IoPrintOutline", "IoAlbumsOutline",

  // Bootstrap Icons (bs)
  "BsGithub", "BsTwitter", "BsLinkedin", "BsEnvelopeFill", "BsLink45deg", "BsSearch", "BsGearFill", "BsHouseDoorFill", "BsCloudFill", "BsChatDotsFill",
  "BsRssFill", "BsPencilSquare", "BsFileEarmarkTextFill", "BsFileEarmarkZipFill", "BsFileEarmarkCodeFill", "BsFileEarmarkSpreadsheetFill", 
  "BsBookFill", "BsShareFill", "BsCardImage", "BsImageFill", "BsHandThumbsUpFill", "BsHandThumbsDownFill", "BsPersonCircle", "BsPeopleFill",
  "BsFolder2Open", "BsFolderFill", "BsTagFill", "BsTagsFill", "BsCalendar2EventFill", "BsGeoAltFill", "BsInfoCircleFill", "BsExclamationTriangleFill",
  "BsCheckCircleFill", "BsXCircleFill", "BsArrowClockwise", "BsChatQuoteFill", "BsCodeSlash", "BsTerminalFill", "BsDatabaseFill", "BsSaveFill", "BsPrinterFill",
  
  // Tabler Icons (tb)
  "TbBrandGithub", "TbBrandTwitter", "TbMail", "TbLink", "TbSearch", "TbSettings", "TbHome2", "TbRss", "TbPencil", "TbFileText", 
  "TbArticle", "TbMessageCircle", "TbThumbUp", "TbThumbDown", "TbBook", "TbShare", "TbPhoto", "TbLayoutDashboard", "TbUserCircle", "TbUsers", 
  "TbExternalLink", "TbFolderOpen", "TbFolder", "TbTag", "TbCalendarEvent", "TbMapPin", "TbInfoCircle", "TbAlertTriangle", "TbCircleCheck", 
  "TbCircleX", "TbLoader2", "TbQuote", "TbCode", "TbTerminal2", "TbDatabase", "TbDeviceFloppy", "TbPrinter", "TbNotes", "TbMarkdown", "TbListDetails",

  // Feather Icons (fi)
  "FiGithub", "FiTwitter", "FiMail", "FiLink", "FiSearch", "FiSettings", "FiHome", "FiRss", "FiEdit3", "FiFileText",
  "FiMessageSquare", "FiThumbsUp", "FiThumbsDown", "FiBookOpen", "FiShare2", "FiImage", "FiUser", "FiUsers", "FiExternalLink",
  "FiFolderPlus", "FiFolderMinus", "FiFolder", "FiTag", "FiCalendar", "FiMapPin", "FiInfo", "FiAlertTriangle", "FiCheckCircle",
  "FiXCircle", "FiLoader", "FiType", "FiCode", "FiTerminal", "FiHardDrive", "FiSave", "FiPrinter", "FiSidebar", "FiLayout",
  
  // Ant Design Icons (ai)
  "AiOutlineGithub", "AiOutlineTwitter", "AiOutlineMail", "AiOutlineLink", "AiOutlineSearch", "AiOutlineSetting", "AiOutlineHome", "AiOutlineRss", 
  "AiOutlineEdit", "AiOutlineFileText", "AiOutlineFileMarkdown", "AiOutlineFilePdf", "AiOutlineFileImage", "AiOutlineFileZip",
  "AiOutlineComment", "AiOutlineLike", "AiOutlineDislike", "AiOutlineBook", "AiOutlineShareAlt", "AiOutlinePicture", "AiOutlineUser", "AiOutlineTeam",
  "AiOutlineFolderOpen", "AiOutlineFolder", "AiOutlineTag", "AiOutlineCalendar", "AiOutlineEnvironment", "AiOutlineInfoCircle", "AiOutlineWarning",
  "AiOutlineCheckCircle", "AiOutlineCloseCircle", "AiOutlineLoading", "AiOutlineApartment", "AiOutlineDatabase", "AiOutlineSave", "AiOutlinePrinter",
  "AiOutlineBarChart", "AiOutlinePieChart", "AiOutlineDotChart", "AiOutlineLayout", "AiOutlineMenu",

  // BoxIcons (bxl, bxs, bi)
  "BxlBlogger", "BxlDeviantart", "BxlDiscordAlt", "BxlDribbble", "BxlFacebookSquare", "BiLogoGithub", "BxlGitlab", "BxlInstagramAlt",
  "BxlMediumSquare", "BxlPaypal", "BxlPinterest", "BxlPocket", "BxlProductHunt", "BxlReddit", "BxlSlackOld", "BxlSoundcloud",
  "BxlSpotify", "BxlStackOverflow", "BxlSteam", "BxlTelegram", "BxlTrello", "BxlTumblr", "BxlTwitch", "BxlTwitter", "BxlVimeo",
  "BxlVisualStudio", "BxlWhatsappSquare", "BxlWordpress", "BxlYoutube", 
  "BxsFileDoc", "BxsFileHtml", "BxsFileCss", "BxsFileJs", "BxsFileJson", "BxsFileMd",
  "BxsFilePdf", "BxsFileTxt", "BxsFilePng", "BxsFileJpg", "BxsFileGif", "BxsFileZip", "BxsFolderOpen", "BxsEditLocation", "BxsCommentDots",
  "BiUserCircle", "BiCog", "BiHomeAlt", "BiRss", "BiEditAlt", "BiFileBlank", "BiCommentDetail", "BiLike", "BiDislike", "BiBookAlt", 
  "BiShareAlt", "BiImageAlt", "BiFolderOpen", "BiFolder", "BiPurchaseTagAlt", "BiCalendarEvent", "BiMapAlt", "BiInfoCircle", "BiErrorAlt",
  "BiCheckCircle", "BiXCircle", "BiLoaderAlt", "BiCodeAlt", "BiTerminal", "BiData", "BiSave", "BiPrinter",

  // Game Icons (gi)
  "GiBookmarklet", "GiBookshelf", "GiSpellBook", "GiScrollQuill", "GiQuillInk",
  
  // Github Octicons (go)
  "GoHome", "GoRepo", "GoIssueOpened", "GoGitCommit", "GoGitBranch", "GoTag", "GoMegaphone", "GoOrganization", "GoProject", "GoSearch",

  // Grommet Icons (gr)
  "GrGraphQl", "GrBlog", "GrDocumentText", "GrRss", "GrEdit", "GrUserSettings", "GrHomeRounded", "GrLinkNext", "GrShareOption", "GrTag",

  // Heroicons (hi for v1, hi2 for v2)
  "HiOutlineHome", "HiOutlineCog", "HiOutlineUserCircle", "HiOutlineLink", "HiOutlineSearch", "HiOutlineRss", "HiOutlinePencilAlt", "HiOutlineDocumentText",
  "HiSolidHome", "HiSolidCog", "HiSolidUserCircle", "HiSolidLink", "HiSolidSearch", "HiSolidRss", "HiSolidPencilAlt", "HiSolidDocumentText",
  "Hi2OutlineHome", "Hi2SolidHome", "Hi2OutlineCog6Tooth", "Hi2SolidCog6Tooth", "Hi2OutlineUserCircle", "Hi2SolidUserCircle", 
  "Hi2OutlineLink", "Hi2SolidLink", "Hi2OutlineMagnifyingGlass", "Hi2SolidMagnifyingGlass", "Hi2OutlineRss", "Hi2SolidRss",
  "Hi2OutlinePencilSquare", "Hi2SolidPencilSquare", "Hi2OutlineDocumentText", "Hi2SolidDocumentText",

  // IcoMoon Free (im)
  "ImHome3", "ImFeed", "ImNewspaper", "ImPencil2", "ImLink", "ImSearch", "ImCog", "ImUser", "ImQuotesLeft", "ImFolderOpen",
  
  // Phosphor Icons (pi)
  "PiHouse", "PiGearSix", "PiUserCircle", "PiLink", "PiMagnifyingGlass", "PiRssSimple", "PiPencilSimpleLine", "PiFileText",
  "PiBookOpenText", "PiChatCircleDots", "PiThumbsUp", "PiFolderSimpleOpen", "PiTagSimple", "PiCalendarBlank", "PiMapPinLine", "PiInfo",
  "PiWarningCircle", "PiCheckCircle", "PiXCircle", "PiSpinnerGap", "PiQuotes", "PiCodeSimple", "PiTerminalWindow", "PiDatabase", "PiFloppyDisk", "PiPrinter",

  // Remix Icon (ri)
  "RiHome4Line", "RiSettings3Line", "RiUser3Line", "RiLinkM", "RiSearchLine", "RiRssLine", "RiPencilLine", "RiFileTextLine",
  "RiBook2Line", "RiChat1Line", "RiThumbUpLine", "RiFolderOpenLine", "RiPriceTag3Line", "RiCalendarLine", "RiMapPinLine", "RiInformationLine",
  "RiAlertLine", "RiCheckboxCircleLine", "RiCloseCircleLine", "RiLoader4Line", "RiDoubleQuotesL", "RiCodeLine", "RiTerminalLine", "RiDatabase2Line",
  "RiSaveLine", "RiPrinterLine",

  // Simple Line Icons (sl)
  "SlHome", "SlSettings", "SlUser", "SlLink", "SlMagnifier", "SlFeed", "SlPencil", "SlDocs",
  "SlBookOpen", "SlBubble", "SlLike", "SlFolderAlt", "SlTag", "SlCalender", "SlLocationPin", "SlInfo",
  "SlExclamation", "SlCheck", "SlClose", "SlRefresh", "SlSpeech", "SlActionRedo", "SlActionUndo", "SlPaperPlane",

  // CSS.gg (cg)
  "CgProfile", "CgOptions", "CgHomeAlt", "CgFeed", "CgEditBlackPoint", "CgFileDocument", "CgComment", "CgSmile", "CgMoreVerticalAlt", "CgInstagram",
  
  // Typicons (ti)
  "TiHomeOutline", "TiCogOutline", "TiUserOutline", "TiLinkOutline", "TiSearchOutline", "TiRssOutline", "TiPencil", "TiDocumentText",
  "TiBook", "TiMessage", "TiThumbsUp", "TiFolderOpen", "TiTag", "TiCalendarOutline", "TiLocationOutline", "TiInfoOutline",
  "TiWarningOutline", "TiInputCheckedOutline", "TiTimesOutline", "TiRefreshOutline", "TiFlashOutline", "TiCodeOutline",

  // VS Code Icons (vsc)
  "VscAccount", "VscSettingsGear", "VscSearch", "VscRss", "VscEdit", "VscFile", "VscSymbolFile", "VscRepo", "VscSourceControl", "VscVmActive",

  // Weather Icons (wi)
  "WiDaySunny", "WiNightClear", "WiCloudy", "WiRain", "WiSnow", "WiThunderstorm", "WiFog", "WiThermometer", "WiHumidity", "WiWindy",

  // Lucide Icons (lu) - Converted to react-icons/lu naming convention
  "LuMail", "LuGithub", "LuTwitter", "LuLinkedin", "LuLink2", "LuSearch", "LuSettings", "LuHome", "LuRss", "LuPencil", "LuFileText", // LuEdit3 -> LuPencil, LuLink -> LuLink2 (common alias)
  "LuImage", "LuUserCircle", "LuHelpCircle", "LuExternalLink", "LuPlusCircle", "LuTrash2", "LuMailPlus", // Added LuMailPlus
  
  // Simple Icons (si) - Converted to react-icons/si naming convention (PascalCase, Si Prefix)
  "SiGithub", "SiTwitter", "SiLinkedin", "SiBilibili", "SiSteam", "SiNeteasecloudmusic", "SiTiktok",
  "SiBlogger", "SiWordpress", "SiMedium", "SiGhost", "SiSubstack", "SiPatreon", "SiPaypal", "SiDiscord",
  "SiWechat", "SiAlipay", "SiDouban", "SiZhihu", "SiPinterest", "SiYoutube", "SiInstagram", "SiFacebook",
  "SiGoogle", "SiMicrosoft", "SiApple", "SiAmazon", "SiNetflix", "SiSpotify", "SiSoundcloud", "SiReddit",
  "SiWhatsapp", "SiTelegram", "SiSlack", "SiZoom", "SiSkype", "SiTrello", "SiAsana", "SiJira",
  "SiConfluence", "SiNotion", "SiEvernote", "SiDropbox", "SiGoogledrive", "SiMicrosoftonedrive",
  "SiFigma", "SiAdobephotoshop", "SiAdobeillustrator", "SiAdobexd", "SiAdobecreativecloud", "SiSketch",
  "SiInvision", "SiMarvel", "SiZeplin", "SiAbstract", "SiWebflow", "SiSquarespace", "SiWix",
  "SiGodaddy", "SiNamecheap", "SiWordpress", "SiGhost", "SiJekyll", "SiHugo", "SiGatsby", "SiNextdotjs",
  "SiNuxtdotjs", "SiVuedotjs", "SiReact", "SiAngular", "SiSvelte", "SiEmberdotjs", "SiRubyonrails",
  "SiDjango", "SiFlask", "SiLaravel", "SiSpring", "SiDotnet", "SiNodedotjs", "SiDeno", "SiBun",
  "SiDocker", "SiKubernetes", "SiAmazonaws", "SiGooglecloud", "SiMicrosoftazure", "SiHeroku",
  "SiNetlify", "SiVercel", "SiCloudflare", "SiDigitalocean", "SiLinode", "SiGit", "SiGitlab",
  "SiBitbucket", "SiSourcegraph", "SiStackoverflow", "SiMedium", "SiDevdotto", "SiHashnode",
  "SiHackernoon", "SiFreecodecamp", "SiCodecademy", "SiUdemy", "SiCoursera", "SiEdx", "SiKhanacademy",
  "SiLinux", "SiUbuntu", "SiFedora", "SiDebian", "SiCentos", "SiArchlinux", "SiKalilinux", "SiRaspberrypi",
  "SiAndroid", "SiIos", "SiWindows", "SiMacos", "SiVisualstudiocode", "SiIntellijidea", "SiPycharm",
  "SiWebstorm", "SiSublimetext", "SiAtom", "SiVim", "SiNeovim", "SiEmacs", "SiEclipseide", "SiNetbeans",
  "SiPostman", "SiInsomnia", "SiSwagger", "SiGraphql", "SiFirebase", "SiMongodb", "SiMysql", "SiPostgresql",
  "SiSqlite", "SiRedis", "SiElasticsearch", "SiSupabase", "SiAirtable", "SiZapier", "SiIfttt", "SiAutomattic",
  "SiTesla", "SiSpacex", "SiNasa", "SiPaypal", "SiStripe", "SiVisa", "SiMastercard", "SiAmericanexpress",
  "SiBitcoin", "SiEthereum", "SiDogecoin", "SiBinance", "SiCoinbase", "SiWikipedia", "SiArchiveofourown",
  "SiWarcraft", "SiMinecraft", "SiFortnite", "SiRoblox", "SiLeagueoflegends", "SiValorant", "SiCounterstrike",
  "SiDota2", "SiOverwatch", "SiPubg", "SiApexlegends", "SiSteam", "SiEpicgames", "SiGogdotcom", "SiItchdotio",
  "SiPlaystation", "SiXbox", "SiNintendo", "SiTwitch", "SiYoutubegaming", "SiFacebookgaming", "SiDiscord",
  "SiUnity", "SiUnrealengine", "SiGodotengine", "SiBlender", "SiAutodesk", "SiKrita", "SiGimp",
  "SiObsstudio", "SiVlcmediaplayer", "SiSpotify", "SiApplemusic", "SiYoutubemusic", "SiDeezer", "SiTidal",
  "SiPandora", "SiBandcamp", "SiAudible", "SiPocketcasts", "SiOvercast", "SiNetflix", "SiHulu",
  "SiAmazonprimevideo", "SiHbo", "SiDisqus", "SiPatreon", "SiKofi", "SiLiberapay", "SiBuymeacoffee",
  "SiGithubsponsors", "SiOpencollective", "SiKickstarter", "SiIndiegogo", "SiProducthunt", "SiAngellist",
  "SiCrunchbase", "SiYcombinator", "SiForbes", "SiBloomberg", "SiReuters", "SiThenewyorktimes",
  "SiTheguardian", "SiBbc", "SiCnn", "SiNpr", "SiMedium", "SiWikipedia", "SiStackexchange", "SiQuora",
  "SiReddit", "SiTumblr", "SiPinterest", "SiInstagram", "SiFacebook", "SiTiktok", "SiSnapchat",
  "SiDribbble", "SiBehance", "SiArtstation", "SiDeviantart", "SiFlickr", "SiFivehundredpx",
  "SiUnsplash", "SiPexels", "SiPixabay", "SiSlack", "SiMicrosoftteams", "SiGooglechat", "SiZoom",
  "SiSkype", "SiDiscord", "SiTelegram", "SiWhatsapp", "SiSignal", "SiViber", "SiLine", "SiWechat", "SiTencentqq",
  "SiMastodon", "SiDiaspora", "SiMatrix", "SiElement", "SiXmpp", "SiIrc", "SiRss", "SiDribbble", "SiBehance",
  "SiGithub", "SiGitlab", "SiBitbucket", "SiCodeberg", "SiGitea", "SiStackoverflow", "SiLeetcode", "SiKaggle",
  "SiTopcoder", "SiCodewars", "SiHackerrank", "SiExercism", "SiCodeforces", "SiCodingninjas",
  "SiGooglescholar", "SiResearchgate", "SiAcademia", "SiMendeley", "SiZotero", "SiOverleaf", "SiArxiv",
  "SiDouban", "SiAnilist", "SiMyanimelist", "SiKitsu", "SiGoodreads", "SiLetterboxd", "SiTrakt", "SiLastdotfm",
  "SiRateyourmusic", "SiGenius", "SiDuolingo", "SiMemrise", "SiBabbel", "SiRosettastone",
  // Common Brands and Services
  "SiZoom", "SiNetflix", "SiSpotify", "SiAirbnb", "SiUber", "SiLyft", "SiPaypal", "SiStripe",
  "SiShopify", "SiEtsy", "SiEbay", "SiAmazon", "SiAliexpress", "SiBestbuy", "SiTarget", "SiWalmart",
  "SiMcdonalds", "SiStarbucks", "SiBurgerking", "SiKfc", "SiDominos", "SiPizzahut", "SiSubway",
  "SiFedex", "SiUps", "SiDhl", "SiUsps", "SiBritishairways", "SiAmericanairlines", "SiDelta", "SiLufthansa",
  "SiEmirates", "SiRyanair", "SiEasyjet", "SiAccenture", "SiIbm", "SiOracle", "SiSap", "SiSalesforce",
  "SiDeloitte", "SiPwc", "SiKpmg", "SiChase", "SiBankofamerica", "SiWellsfargo", "SiCitibank", "SiHsbc",
  "SiBarclays", "SiGoldmansachs", "SiMorganstanley", "SiVisa", "SiMastercard", "SiAmericanexpress",
  "SiToyota", "SiHonda", "SiFord", "SiBmw", "SiMercedesbenz", "SiVolkswagen", "SiAudi", "SiTesla", "SiVolvo",
  "SiNike", "SiAdidas", "SiPuma", "SiReebok", "SiUnderarmour", "SiNewbalance", "SiAsics", "SiFila",
  "SiCoca-cola", "SiPepsi", "SiNestle", "SiUnilever", "SiProcterandgamble", "SiSony", "SiSamsung", "SiLg",
  "SiPanasonic", "SiPhilips", "SiDell", "SiHp", "SiLenovo", "SiAcer", "SiAsus", "SiApple", "SiMicrosoft",
  "SiGoogle", "SiIntel", "SiAmd", "SiNvidia", "SiQualcomm", "SiIkea", "SiZara", "SiHandm", "SiUniqlo",
  "SiChanel", "SiGucci", "SiPrada", "SiHermes", "SiLouisvuitton", "SiRolex", "SiOmega", "SiCartier"
];

interface SocialIconInputProps {
  value: string;
  onChange: (value: string) => void;
  // iconSize can be a prop if different parts of the app need different preview sizes
  previewIconSize?: number; 
}

export function SocialIconInput({ value, onChange, previewIconSize = 22 }: SocialIconInputProps) {
  const [input, setInput] = useState(value || "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [previewIconName, setPreviewIconName] = useState(value || ""); 
  const inputRef = useRef<HTMLInputElement>(null);

  // All suggestions now come from the unified representativeReactIcons list
  const allIconNames = useMemo(() => 
    [...new Set(representativeReactIcons)].sort()
  , []); // No dependencies as representativeReactIcons is static within this file now

  useEffect(() => {
    const currentSuggestions = input
      ? allIconNames.filter(name => name.toLowerCase().includes(input.toLowerCase())).slice(0, 15)
      : [];
    if (currentSuggestions.length > 0) {
      setPreviewIconName(currentSuggestions[0]);
    } else {
      setPreviewIconName(input); 
    }
  }, [input, allIconNames]);

  useEffect(() => {
    setInput(value || "");
    setPreviewIconName(value || ""); 
  }, [value]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const currentValue = e.target.value;
    setInput(currentValue);
    onChange(currentValue); 
    setShowDropdown(currentValue.trim() !== '');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setPreviewIconName(suggestion); 
    onChange(suggestion); 
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const suggestions = input
    ? allIconNames.filter(name => name.toLowerCase().includes(input.toLowerCase())).slice(0, 15)
    : [];

  return (
    <div className="relative flex items-center w-full">
      <Input
        ref={inputRef}
        value={input} 
        onChange={handleInputChange}
        onFocus={() => {
          if (input.trim() !== '') {
            setShowDropdown(true);
          }
        }}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        placeholder="E.g., FaGithub, LuMail, SiBilibili"
        className="pr-12"
      />
      <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center w-7 h-7 justify-center pointer-events-none">
        {getSocialIconComponent(previewIconName, previewIconSize)}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition" tabIndex={-1}>
            {/* Using LuHelpCircle from react-icons/lu via getSocialIconComponent for consistency */}
            {getSocialIconComponent("LuHelpCircle", 20)} 
          </button>
        </PopoverTrigger>
        <PopoverContent className="max-w-xs text-sm">
          Type to search for an icon from React Icons (e.g., FaGithub, LuMail, SiBilibili). 
          Ensure you use the correct PascalCase name from the desired react-icons set (fa, md, lu, si, etc.).
        </PopoverContent>
      </Popover>
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-20 bg-white border rounded shadow max-h-56 overflow-y-auto left-0 w-full top-full mt-1 dark:bg-zinc-800 dark:border-zinc-700">
          {suggestions.map(s => (
            <div
              key={s}
              className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent dark:hover:bg-zinc-700"
              onMouseDown={() => {
                handleSuggestionClick(s);
              }}
            >
              <span>{s}</span>
              <span>{getSocialIconComponent(s, previewIconSize)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 