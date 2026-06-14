# Graph Report - .  (2026-06-12)

## Corpus Check
- Large corpus: 789 files · ~1,377,349 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 1934 nodes · 5359 edges · 304 communities (269 shown, 35 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin & Panel Pages|Admin & Panel Pages]]
- [[_COMMUNITY_Admin Context & Email UI|Admin Context & Email UI]]
- [[_COMMUNITY_Blog Post Editor|Blog Post Editor]]
- [[_COMMUNITY_Client Portal & Ads|Client Portal & Ads]]
- [[_COMMUNITY_Cases & Transactions|Cases & Transactions]]
- [[_COMMUNITY_Admin Content Tools|Admin Content Tools]]
- [[_COMMUNITY_App Layout & Providers|App Layout & Providers]]
- [[_COMMUNITY_Calendar & Icon Picker|Calendar & Icon Picker]]
- [[_COMMUNITY_Auth & Campaigns|Auth & Campaigns]]
- [[_COMMUNITY_Help Center|Help Center]]
- [[_COMMUNITY_Accounts & Notifications|Accounts & Notifications]]
- [[_COMMUNITY_Expert Consultations|Expert Consultations]]
- [[_COMMUNITY_Expert Case Detail|Expert Case Detail]]
- [[_COMMUNITY_Expert Offers & Profile|Expert Offers & Profile]]
- [[_COMMUNITY_Law Firm Statistics|Law Firm Statistics]]
- [[_COMMUNITY_Reviews & Points|Reviews & Points]]
- [[_COMMUNITY_Homepage & Categories|Homepage & Categories]]
- [[_COMMUNITY_Authentication Flow|Authentication Flow]]
- [[_COMMUNITY_Expert Services|Expert Services]]
- [[_COMMUNITY_Marketing Pages|Marketing Pages]]
- [[_COMMUNITY_Image Cropper|Image Cropper]]
- [[_COMMUNITY_Messaging & Subscriptions|Messaging & Subscriptions]]
- [[_COMMUNITY_Client Consultations|Client Consultations]]
- [[_COMMUNITY_Expert Dashboard|Expert Dashboard]]
- [[_COMMUNITY_Menubar UI|Menubar UI]]
- [[_COMMUNITY_Partner Club|Partner Club]]
- [[_COMMUNITY_Panel Layout & Footer|Panel Layout & Footer]]
- [[_COMMUNITY_Ads Management|Ads Management]]
- [[_COMMUNITY_Admin Detail Pages|Admin Detail Pages]]
- [[_COMMUNITY_Expert Blog Tab|Expert Blog Tab]]
- [[_COMMUNITY_Expert Services Tab|Expert Services Tab]]
- [[_COMMUNITY_Expert Profile Form|Expert Profile Form]]
- [[_COMMUNITY_Client Cases|Client Cases]]
- [[_COMMUNITY_Blog & Email Templates|Blog & Email Templates]]
- [[_COMMUNITY_Document Management|Document Management]]
- [[_COMMUNITY_Law Firm Admin|Law Firm Admin]]
- [[_COMMUNITY_Profile Editors|Profile Editors]]
- [[_COMMUNITY_Law Firm List Item|Law Firm List Item]]
- [[_COMMUNITY_Breadcrumb UI|Breadcrumb UI]]
- [[_COMMUNITY_Homepage Consultations|Homepage Consultations]]
- [[_COMMUNITY_Permissions & Packages|Permissions & Packages]]
- [[_COMMUNITY_Blog Page|Blog Page]]
- [[_COMMUNITY_Homepage Hero|Homepage Hero]]
- [[_COMMUNITY_Admin Layout|Admin Layout]]
- [[_COMMUNITY_Public Pages|Public Pages]]
- [[_COMMUNITY_Expert Onboarding Tour|Expert Onboarding Tour]]
- [[_COMMUNITY_Expert Import|Expert Import]]
- [[_COMMUNITY_Account Settings|Account Settings]]
- [[_COMMUNITY_Category Management|Category Management]]
- [[_COMMUNITY_Checkout|Checkout]]
- [[_COMMUNITY_Search Help Section|Search Help Section]]
- [[_COMMUNITY_Homepage Benefits|Homepage Benefits]]
- [[_COMMUNITY_Checkout Success|Checkout Success]]
- [[_COMMUNITY_3D Card UI|3D Card UI]]
- [[_COMMUNITY_Admin Blog Post|Admin Blog Post]]
- [[_COMMUNITY_Cases API Route|Cases API Route]]
- [[_COMMUNITY_Dev Utilities|Dev Utilities]]
- [[_COMMUNITY_Layout Grid UI|Layout Grid UI]]
- [[_COMMUNITY_Rich Text Editor|Rich Text Editor]]
- [[_COMMUNITY_Email Verification|Email Verification]]
- [[_COMMUNITY_Cases Cases|Cases Cases]]
- [[_COMMUNITY_Conversations Id Messages|Conversations Id Messages]]
- [[_COMMUNITY_Law Firm Categories|Law Firm Categories]]
- [[_COMMUNITY_App Public Ekspert|App Public Ekspert]]
- [[_COMMUNITY_App Public Ekspert|App Public Ekspert]]
- [[_COMMUNITY_App Public Kategorie|App Public Kategorie]]
- [[_COMMUNITY_Area|Area]]
- [[_COMMUNITY_Post Page|Post Page]]
- [[_COMMUNITY_Promotions|Promotions]]
- [[_COMMUNITY_Scheduler|Scheduler]]
- [[_COMMUNITY_Weryfikacja Email Emailverificationclientpage|Weryfikacja Email Emailverificationclientpage]]
- [[_COMMUNITY_Conversations Id Read|Conversations Id Read]]
- [[_COMMUNITY_Conversations Id Id|Conversations Id Id]]
- [[_COMMUNITY_Components Promotionbadge|Components Promotionbadge]]
- [[_COMMUNITY_Dodaj Sprawe Page|Dodaj Sprawe Page]]
- [[_COMMUNITY_Drukuj Page|Drukuj Page]]
- [[_COMMUNITY_Ekspert Page|Ekspert Page]]
- [[_COMMUNITY_Import Law Firms|Import Law Firms]]
- [[_COMMUNITY_Klient Page|Klient Page]]
- [[_COMMUNITY_Kontakt Page|Kontakt Page]]
- [[_COMMUNITY_Logowanie Page|Logowanie Page]]
- [[_COMMUNITY_Lost Password Page|Lost Password Page]]
- [[_COMMUNITY_Potwierdz Page|Potwierdz Page]]
- [[_COMMUNITY_Ranking Page|Ranking Page]]
- [[_COMMUNITY_Reset Hasla Page|Reset Hasla Page]]
- [[_COMMUNITY_Szukaj Prawnika Page|Szukaj Prawnika Page]]
- [[_COMMUNITY_Testimonials Page|Testimonials Page]]
- [[_COMMUNITY_Ui Focus Cards|Ui Focus Cards]]
- [[_COMMUNITY_Ui Toggle|Ui Toggle]]
- [[_COMMUNITY_Ui Wysiwyg Editor|Ui Wysiwyg Editor]]
- [[_COMMUNITY_Wypisz Sie Page|Wypisz Sie Page]]
- [[_COMMUNITY_Wyslij Ponownie Weryfikacje|Wyslij Ponownie Weryfikacje]]
- [[_COMMUNITY_Nextauth Get Post|Nextauth Get Post]]

## God Nodes (most connected - your core abstractions)
1. `Button` - 162 edges
2. `Card` - 128 edges
3. `CardContent` - 125 edges
4. `CardHeader` - 116 edges
5. `CardTitle` - 108 edges
6. `Input` - 90 edges
7. `Badge()` - 84 edges
8. `CardDescription` - 73 edges
9. `SelectTrigger` - 60 edges
10. `SelectContent` - 60 edges

## Surprising Connections (you probably didn't know these)
- `BlogPage()` --calls--> `formatViews()`  [INFERRED]
  app/(public)/blog/BlogPageClient.tsx → components/ekspert/BlogTab.tsx
- `BlogPostPage()` --calls--> `formatViews()`  [INFERRED]
  app/(public)/blog/[slug]/BlogPostClientPage.tsx → components/ekspert/BlogTab.tsx
- `RankingBoostPage()` --calls--> `useToast()`  [EXTRACTED]
  app/panel-eksperta/pozycja-ogloszenia/page.tsx → components/ui/use-toast.ts
- `LawFirmPromotionPage()` --calls--> `useToast()`  [EXTRACTED]
  app/panel-eksperta/promowanie/page.tsx → components/ui/use-toast.ts
- `ScheduledEmailsTab()` --calls--> `getStatusBadge()`  [INFERRED]
  components/admin/ScheduledEmailsTab.tsx → app/panel-klienta/oferty/page.tsx

## Import Cycles
- None detected.

## Communities (304 total, 35 thin omitted)

### Community 0 - "Admin & Panel Pages"
Cohesion: 0.07
Nodes (31): PageBuilderProps, DashboardStats, containerVariants, itemVariants, AdminStatisticsCardProps, PromotedLawFirmCardProps, PromotionFormatsProps, containerVariants (+23 more)

### Community 1 - "Admin Context & Email UI"
Cohesion: 0.06
Nodes (44): AdminHeaderSetter(), AdminHeaderSetterProps, AdminTitleProviderProps, TitleContext, TitleContextType, useAdminTitle(), EmailLog, ScheduledEmail (+36 more)

### Community 2 - "Blog Post Editor"
Cohesion: 0.06
Nodes (57): BlogPostFormProps, containerVariants, itemVariants, postFormSchema, PostFormValues, postSchema, RichTextEditor, CategoryFormProps (+49 more)

### Community 3 - "Client Portal & Ads"
Cohesion: 0.05
Nodes (46): Ad, AdBanner(), AdBannerProps, LawFirmCardWrapper(), LawFirmCardWrapperProps, CaseType, clientCitiesCache, FileAttachment (+38 more)

### Community 4 - "Cases & Transactions"
Cohesion: 0.07
Nodes (49): offerStatusLabels, statusLabels, statusLabels, Case, Client, Offer, statusLabels, FavoriteLawFirm (+41 more)

### Community 5 - "Admin Content Tools"
Cohesion: 0.07
Nodes (39): Block, BlockImporter(), BlockImporterProps, ScheduledEmailsTab(), cardVariants, Case, containerVariants, formatCurrency() (+31 more)

### Community 6 - "App Layout & Providers"
Cohesion: 0.05
Nodes (41): geistMono, playfairDisplay, poppins, Providers(), ChatAssistant(), Message, ThemeProvider(), Competitor (+33 more)

### Community 7 - "Calendar & Icon Picker"
Cohesion: 0.12
Nodes (31): CATEGORIES, IconPicker(), IconPickerProps, POPULAR_ICONS, AgendaView(), CalendarScheduler(), DayView(), detectBrowserTimezone() (+23 more)

### Community 8 - "Auth & Campaigns"
Cohesion: 0.12
Nodes (29): SocialRegistrationButtonsProps, CampaignControlCenter(), CampaignControlCenterProps, CancelPromotionDialog(), CancelPromotionDialogProps, ConfirmPromotionDialog(), ConfirmPromotionDialogProps, NewPromotionDialog() (+21 more)

### Community 9 - "Help Center"
Cohesion: 0.09
Nodes (19): containerVariants, HelpCategory, HelpCenter(), HelpCenterProps, HelpQuestion, itemVariants, clientCitiesCache, PublicHeader() (+11 more)

### Community 10 - "Accounts & Notifications"
Cohesion: 0.11
Nodes (16): triggerBadgeCheck(), AccountManager, AccountManagerWidget(), BusinessPackageWelcomeModal(), NotificationSettingsPromptModal(), ChatAreaProps, ConversationListProps, containerVariants (+8 more)

### Community 11 - "Expert Consultations"
Cohesion: 0.11
Nodes (17): containerVariants, itemVariants, LawFirm, Order, statusLabels, BellIconProps, Notification, NotificationBell() (+9 more)

### Community 12 - "Expert Case Detail"
Cohesion: 0.11
Nodes (20): Case, formatDate(), formatCurrency(), getCaseStatusLabel(), getCaseTypeLabel(), LawFirmCaseDetailsPage(), ActivePromotion, Conflict (+12 more)

### Community 13 - "Expert Offers & Profile"
Cohesion: 0.10
Nodes (13): Offer, AboutTab(), AboutTabProps, BadgesSection(), EnhancedChatArea(), EnhancedConversationList(), EnhancedMessengerLayout(), cardVariants (+5 more)

### Community 14 - "Law Firm Statistics"
Cohesion: 0.10
Nodes (16): categoriesChartConfig, clientTypeChartConfig, containerVariants, itemVariants, offersChartConfig, starsChartConfig, StatsData, urgencyChartConfig (+8 more)

### Community 15 - "Reviews & Points"
Cohesion: 0.12
Nodes (10): SubscriptionPlan, formatCurrency(), LawFirm, LawFirmPointsPage(), Order, OrdersResponse, POINT_PACKAGES, Badge() (+2 more)

### Community 16 - "Homepage & Categories"
Cohesion: 0.11
Nodes (14): BusinessCategoriesGrid(), BusinessCategoriesGridProps, BusinessCategoryCard, CategoriesGrid(), CategoriesGridProps, CategoryCard, CitiesList(), ExpertCTA() (+6 more)

### Community 17 - "Authentication Flow"
Cohesion: 0.12
Nodes (9): AuthLayout(), AuthLayoutProps, HeroStat, LoginHistory(), LoginRecord, metadata, metadata, NumberTicker() (+1 more)

### Community 18 - "Expert Services"
Cohesion: 0.13
Nodes (5): PageHeader(), PageHeaderProps, AreaData, LawFirmCategory, SortableItemProps

### Community 19 - "Marketing Pages"
Cohesion: 0.15
Nodes (6): metadata, LatestArticles(), LatestArticlesProps, InteractiveHoverButton(), ResponsiveBreadcrumbs(), metadata

### Community 20 - "Image Cropper"
Cohesion: 0.16
Nodes (13): CropperProps, ImageCrop(), ImageCropApply(), ImageCropApplyProps, ImageCropContent(), ImageCropContentProps, ImageCropContext, ImageCropContextType (+5 more)

### Community 21 - "Messaging & Subscriptions"
Cohesion: 0.17
Nodes (12): EnhancedConversationListProps, containerVariants, Invoice, itemVariants, LawFirm, Order, orderStatusConfig, statusConfig (+4 more)

### Community 22 - "Client Consultations"
Cohesion: 0.13
Nodes (11): containerVariants, itemVariants, Case, containerVariants, offerStatusLabels, statusLabels, caseTypeLabels, contactTypeLabels (+3 more)

### Community 23 - "Expert Dashboard"
Cohesion: 0.14
Nodes (10): Case, containerVariants, DashboardData, formatDate(), getBannerStyles(), getSubscriptionBadge(), itemVariants, LawFirmDashboardPage() (+2 more)

### Community 24 - "Menubar UI"
Cohesion: 0.12
Nodes (10): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarSubContent (+2 more)

### Community 25 - "Partner Club"
Cohesion: 0.20
Nodes (11): formatDateTime(), MONTH_NAMES, KlubPartnerskiPage(), PartnerStatus, PointsHistory, UpgradeAlert(), UpgradeAlertProps, Alert (+3 more)

### Community 26 - "Panel Layout & Footer"
Cohesion: 0.15
Nodes (9): PanelFooter(), PanelFooterProps, navigation, SheetContent, SheetContentProps, SheetDescription, SheetOverlay, SheetTitle (+1 more)

### Community 27 - "Ads Management"
Cohesion: 0.31
Nodes (9): AdsTab(), AdsTabProps, ClientsTab(), ClientsTabProps, RotationsTab(), RotationsTabProps, AD_LOCATIONS, AdClient (+1 more)

### Community 28 - "Admin Detail Pages"
Cohesion: 0.15
Nodes (9): formatDate(), NotFound(), EditBadgeClient(), EditBadgePage(), MailDetailPage(), metadata, MailsPage(), metadata (+1 more)

### Community 29 - "Expert Blog Tab"
Cohesion: 0.16
Nodes (6): MagicCard(), MagicCardProps, BlogTab(), BlogTabProps, ICON_MAP, metadata

### Community 30 - "Expert Services Tab"
Cohesion: 0.16
Nodes (10): ReviewsSection(), Service, ServicesTab(), ServicesTabProps, serviceUnitLabels, clientCitiesCache, lawFirmTypeLabels, serviceUnitLabels (+2 more)

### Community 31 - "Expert Profile Form"
Cohesion: 0.17
Nodes (9): ConsultationHoursForm(), BasicTab(), BasicTabProps, RichTextEditor, ContactTab(), MultimediaTab(), OfficeHoursCard(), SpecializationTab() (+1 more)

### Community 32 - "Client Cases"
Cohesion: 0.18
Nodes (9): cardVariants, Case, containerVariants, caseTypeLabels, statusLabels, AvatarGroup(), AvatarGroupItemProps, AvatarGroupProps (+1 more)

### Community 33 - "Blog & Email Templates"
Cohesion: 0.20
Nodes (5): PageProps, availableVariables, EmailTemplate, emailTypes, Separator

### Community 34 - "Document Management"
Cohesion: 0.20
Nodes (9): Document, DocumentFormValues, documentSchema, DocumentsPage(), formatFileSize(), getDocumentTypeLabel(), rowVariants, statsContainerVariants (+1 more)

### Community 35 - "Law Firm Admin"
Cohesion: 0.33
Nodes (7): AdminNotificationSettingsCard(), AdminNotificationSettingsCardProps, AdminStatisticsCard(), AccountManager, LawFirmFormValues, lawFirmSchema, NotificationSettings

### Community 36 - "Profile Editors"
Cohesion: 0.18
Nodes (10): BusinessHoursEditor(), BusinessHoursEditorProps, DAYS_OF_WEEK, EducationEditor(), EducationEditorProps, EducationEntry, GalleryEditor(), GalleryEditorProps (+2 more)

### Community 37 - "Law Firm List Item"
Cohesion: 0.24
Nodes (6): getOpinieText(), isLawFirmOpen(), LawFirmListItem(), LawFirmListItemProps, ArrowUpLeftIcon(), IconProps

### Community 38 - "Breadcrumb UI"
Cohesion: 0.31
Nodes (9): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator(), BreadcrumbItemData (+1 more)

### Community 39 - "Homepage Consultations"
Cohesion: 0.24
Nodes (7): CATEGORY_TABS, MostConsultedCategories(), MostConsultedCategoriesProps, CATEGORIES, RecommendedLawyers(), RecommendedLawyersProps, TooltipContent

### Community 40 - "Permissions & Packages"
Cohesion: 0.27
Nodes (7): ExpiredPackageModal(), FeatureLockedCard(), FeatureLockedCardProps, PackageBadge(), PackageBadgeProps, PackageType, CardFooter

### Community 41 - "Blog Page"
Cohesion: 0.25
Nodes (5): BlogPage(), metadata, formatViews(), BlogPostPage(), Skeleton()

### Community 42 - "Homepage Hero"
Cohesion: 0.28
Nodes (3): ParticlesBackground(), HeroSection(), metadata

### Community 43 - "Admin Layout"
Cohesion: 0.32
Nodes (5): AdminPageTitle(), AdminTitleProvider(), useAdminTitleContext(), navigation, AdminNotificationBell()

### Community 44 - "Public Pages"
Cohesion: 0.29
Nodes (4): PageProps, ContactForm(), DynamicPageContent(), DynamicPageContentProps

### Community 45 - "Expert Onboarding Tour"
Cohesion: 0.39
Nodes (6): ExpertTourButton(), ExpertTourButtonProps, ExpertTourManager(), getPageKey(), getTourKey(), TOUR_STEPS

### Community 46 - "Expert Import"
Cohesion: 0.32
Nodes (4): ImportResult, LimitIndicator(), LimitIndicatorProps, Progress

### Community 47 - "Account Settings"
Cohesion: 0.29
Nodes (7): ConfirmDeleteDialog(), AccountInfo, containerVariants, formatDateTime(), LawFirmSettingsPage(), NotificationSettings, UserData

### Community 48 - "Category Management"
Cohesion: 0.33
Nodes (3): CategoryForm(), CategoryFormValues, EditCategoryPageProps

### Community 49 - "Checkout"
Cohesion: 0.43
Nodes (5): CheckoutPage(), formatCurrency(), OrderData, RadioGroup, RadioGroupItem

### Community 51 - "Homepage Benefits"
Cohesion: 0.33
Nodes (4): benefits, BenefitsSection(), containerVariants, itemVariants

### Community 52 - "Checkout Success"
Cohesion: 0.47
Nodes (4): CheckoutSuccessPage(), formatCurrency(), formatDate(), Order

### Community 53 - "3D Card UI"
Cohesion: 0.40
Nodes (3): CardItem(), MouseEnterContext, useMouseEnter()

### Community 55 - "Cases API Route"
Cohesion: 0.70
Nodes (4): DELETE(), GET(), PUT(), logErrorToFile()

### Community 75 - "Cases Cases"
Cohesion: 0.83
Nodes (3): GET(), POST(), logErrorToFile()

### Community 81 - "Law Firm Categories"
Cohesion: 0.83
Nodes (3): GET(), getMaxCategories(), PUT()

### Community 92 - "Area"
Cohesion: 0.83
Nodes (3): GET(), getLimits(), PUT()

### Community 98 - "Scheduler"
Cohesion: 0.83
Nodes (3): GET(), POST(), requireAdmin()

## Knowledge Gaps
- **475 isolated node(s):** `PageProps`, `PageProps`, `metadata`, `metadata`, `metadata` (+470 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **35 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Button` connect `Auth & Campaigns` to `Admin & Panel Pages`, `Admin Context & Email UI`, `Blog Post Editor`, `Client Portal & Ads`, `Cases & Transactions`, `Admin Content Tools`, `App Layout & Providers`, `Calendar & Icon Picker`, `Help Center`, `Accounts & Notifications`, `Expert Consultations`, `Expert Case Detail`, `Expert Offers & Profile`, `Reviews & Points`, `Homepage & Categories`, `Authentication Flow`, `Expert Services`, `Image Cropper`, `Messaging & Subscriptions`, `Client Consultations`, `Expert Dashboard`, `Partner Club`, `Panel Layout & Footer`, `Ads Management`, `Expert Blog Tab`, `Expert Services Tab`, `Expert Profile Form`, `Client Cases`, `Blog & Email Templates`, `Document Management`, `Law Firm Admin`, `Profile Editors`, `Law Firm List Item`, `Permissions & Packages`, `Blog Page`, `Homepage Hero`, `Admin Layout`, `Expert Onboarding Tour`, `Expert Import`, `Ui Wysiwyg Editor`, `Account Settings`, `Checkout`, `Checkout Success`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `Card` connect `Admin & Panel Pages` to `Admin Context & Email UI`, `Blog Post Editor`, `Client Portal & Ads`, `Cases & Transactions`, `Admin Content Tools`, `App Layout & Providers`, `Auth & Campaigns`, `Help Center`, `Accounts & Notifications`, `Expert Consultations`, `Expert Case Detail`, `Expert Offers & Profile`, `Law Firm Statistics`, `Reviews & Points`, `Authentication Flow`, `Expert Services`, `Messaging & Subscriptions`, `Client Consultations`, `Expert Dashboard`, `Partner Club`, `Ads Management`, `Expert Blog Tab`, `Expert Services Tab`, `Expert Profile Form`, `Client Cases`, `Blog & Email Templates`, `Document Management`, `Law Firm Admin`, `Law Firm List Item`, `Permissions & Packages`, `Blog Page`, `Expert Import`, `Account Settings`, `Checkout`, `Checkout Success`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `CardContent` connect `Admin & Panel Pages` to `Admin Context & Email UI`, `Blog Post Editor`, `Client Portal & Ads`, `Cases & Transactions`, `Admin Content Tools`, `App Layout & Providers`, `Auth & Campaigns`, `Help Center`, `Accounts & Notifications`, `Expert Consultations`, `Expert Case Detail`, `Expert Offers & Profile`, `Law Firm Statistics`, `Reviews & Points`, `Authentication Flow`, `Expert Services`, `Messaging & Subscriptions`, `Client Consultations`, `Expert Dashboard`, `Partner Club`, `Ads Management`, `Expert Blog Tab`, `Expert Services Tab`, `Expert Profile Form`, `Client Cases`, `Blog & Email Templates`, `Document Management`, `Law Firm Admin`, `Permissions & Packages`, `Expert Import`, `Account Settings`, `Checkout`, `Checkout Success`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `PageProps`, `PageProps`, `metadata` to the rest of the system?**
  _475 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin & Panel Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.07379979570990806 - nodes in this community are weakly interconnected._
- **Should `Admin Context & Email UI` be split into smaller, more focused modules?**
  _Cohesion score 0.06308473670141673 - nodes in this community are weakly interconnected._
- **Should `Blog Post Editor` be split into smaller, more focused modules?**
  _Cohesion score 0.061416397296503084 - nodes in this community are weakly interconnected._