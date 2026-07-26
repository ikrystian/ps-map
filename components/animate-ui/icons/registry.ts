// PLIK GENEROWANY — nie edytuj ręcznie.
// Źródło: bun scripts/generate-animate-ui-icons-registry.mjs
import type { ComponentType } from "react"

import type { IconProps } from "@/components/animate-ui/icons/icon"

export type AnimateUiIconProps = IconProps<string>
export type AnimateUiIconComponent = ComponentType<AnimateUiIconProps>

/**
 * Leniwe importy ikon Animate UI — dzięki nim strona publiczna pobiera tylko
 * te ikony, które faktycznie są ustawione na kategoriach.
 */
export const ANIMATE_UI_ICON_LOADERS: Record<string, () => Promise<AnimateUiIconComponent>> = {
  "accessibility": () =>
    import("@/components/animate-ui/icons/accessibility").then(
      (mod) => mod.Accessibility as AnimateUiIconComponent,
    ),
  "activity": () =>
    import("@/components/animate-ui/icons/activity").then(
      (mod) => mod.Activity as AnimateUiIconComponent,
    ),
  "airplay": () =>
    import("@/components/animate-ui/icons/airplay").then(
      (mod) => mod.Airplay as AnimateUiIconComponent,
    ),
  "alarm-clock": () =>
    import("@/components/animate-ui/icons/alarm-clock").then(
      (mod) => mod.AlarmClock as AnimateUiIconComponent,
    ),
  "arrow-down": () =>
    import("@/components/animate-ui/icons/arrow-down").then(
      (mod) => mod.ArrowDown as AnimateUiIconComponent,
    ),
  "arrow-left": () =>
    import("@/components/animate-ui/icons/arrow-left").then(
      (mod) => mod.ArrowLeft as AnimateUiIconComponent,
    ),
  "arrow-right": () =>
    import("@/components/animate-ui/icons/arrow-right").then(
      (mod) => mod.ArrowRight as AnimateUiIconComponent,
    ),
  "arrow-up": () =>
    import("@/components/animate-ui/icons/arrow-up").then(
      (mod) => mod.ArrowUp as AnimateUiIconComponent,
    ),
  "arrow-up-down": () =>
    import("@/components/animate-ui/icons/arrow-up-down").then(
      (mod) => mod.ArrowUpDown as AnimateUiIconComponent,
    ),
  "audio-lines": () =>
    import("@/components/animate-ui/icons/audio-lines").then(
      (mod) => mod.AudioLines as AnimateUiIconComponent,
    ),
  "axe": () =>
    import("@/components/animate-ui/icons/axe").then(
      (mod) => mod.Axe as AnimateUiIconComponent,
    ),
  "axis-3d": () =>
    import("@/components/animate-ui/icons/axis-3d").then(
      (mod) => mod.Axis3D as AnimateUiIconComponent,
    ),
  "badge-check": () =>
    import("@/components/animate-ui/icons/badge-check").then(
      (mod) => mod.BadgeCheck as AnimateUiIconComponent,
    ),
  "battery-charging": () =>
    import("@/components/animate-ui/icons/battery-charging").then(
      (mod) => mod.BatteryCharging as AnimateUiIconComponent,
    ),
  "battery-full": () =>
    import("@/components/animate-ui/icons/battery-full").then(
      (mod) => mod.BatteryFull as AnimateUiIconComponent,
    ),
  "battery-low": () =>
    import("@/components/animate-ui/icons/battery-low").then(
      (mod) => mod.BatteryLow as AnimateUiIconComponent,
    ),
  "battery-medium": () =>
    import("@/components/animate-ui/icons/battery-medium").then(
      (mod) => mod.BatteryMedium as AnimateUiIconComponent,
    ),
  "bell": () =>
    import("@/components/animate-ui/icons/bell").then(
      (mod) => mod.Bell as AnimateUiIconComponent,
    ),
  "bell-off": () =>
    import("@/components/animate-ui/icons/bell-off").then(
      (mod) => mod.BellOff as AnimateUiIconComponent,
    ),
  "bell-ring": () =>
    import("@/components/animate-ui/icons/bell-ring").then(
      (mod) => mod.BellRing as AnimateUiIconComponent,
    ),
  "between-horizontal-end": () =>
    import("@/components/animate-ui/icons/between-horizontal-end").then(
      (mod) => mod.BetweenHorizontalEnd as AnimateUiIconComponent,
    ),
  "between-horizontal-start": () =>
    import("@/components/animate-ui/icons/between-horizontal-start").then(
      (mod) => mod.BetweenHorizontalStart as AnimateUiIconComponent,
    ),
  "between-vertical-end": () =>
    import("@/components/animate-ui/icons/between-vertical-end").then(
      (mod) => mod.BetweenVerticalEnd as AnimateUiIconComponent,
    ),
  "between-vertical-start": () =>
    import("@/components/animate-ui/icons/between-vertical-start").then(
      (mod) => mod.BetweenVerticalStart as AnimateUiIconComponent,
    ),
  "binary": () =>
    import("@/components/animate-ui/icons/binary").then(
      (mod) => mod.Binary as AnimateUiIconComponent,
    ),
  "blend": () =>
    import("@/components/animate-ui/icons/blend").then(
      (mod) => mod.Blend as AnimateUiIconComponent,
    ),
  "blocks": () =>
    import("@/components/animate-ui/icons/blocks").then(
      (mod) => mod.Blocks as AnimateUiIconComponent,
    ),
  "bot": () =>
    import("@/components/animate-ui/icons/bot").then(
      (mod) => mod.Bot as AnimateUiIconComponent,
    ),
  "bot-message-square": () =>
    import("@/components/animate-ui/icons/bot-message-square").then(
      (mod) => mod.BotMessageSquare as AnimateUiIconComponent,
    ),
  "bot-off": () =>
    import("@/components/animate-ui/icons/bot-off").then(
      (mod) => mod.BotOff as AnimateUiIconComponent,
    ),
  "brush": () =>
    import("@/components/animate-ui/icons/brush").then(
      (mod) => mod.Brush as AnimateUiIconComponent,
    ),
  "brush-cleaning": () =>
    import("@/components/animate-ui/icons/brush-cleaning").then(
      (mod) => mod.BrushCleaning as AnimateUiIconComponent,
    ),
  "cast": () =>
    import("@/components/animate-ui/icons/cast").then(
      (mod) => mod.Cast as AnimateUiIconComponent,
    ),
  "cctv": () =>
    import("@/components/animate-ui/icons/cctv").then(
      (mod) => mod.Cctv as AnimateUiIconComponent,
    ),
  "chart-bar": () =>
    import("@/components/animate-ui/icons/chart-bar").then(
      (mod) => mod.ChartBar as AnimateUiIconComponent,
    ),
  "chart-bar-decreasing": () =>
    import("@/components/animate-ui/icons/chart-bar-decreasing").then(
      (mod) => mod.ChartBarDecreasing as AnimateUiIconComponent,
    ),
  "chart-bar-increasing": () =>
    import("@/components/animate-ui/icons/chart-bar-increasing").then(
      (mod) => mod.ChartBarIncreasing as AnimateUiIconComponent,
    ),
  "chart-column": () =>
    import("@/components/animate-ui/icons/chart-column").then(
      (mod) => mod.ChartColumn as AnimateUiIconComponent,
    ),
  "chart-column-decreasing": () =>
    import("@/components/animate-ui/icons/chart-column-decreasing").then(
      (mod) => mod.ChartColumnDecreasing as AnimateUiIconComponent,
    ),
  "chart-column-increasing": () =>
    import("@/components/animate-ui/icons/chart-column-increasing").then(
      (mod) => mod.ChartColumnIncreasing as AnimateUiIconComponent,
    ),
  "chart-line": () =>
    import("@/components/animate-ui/icons/chart-line").then(
      (mod) => mod.ChartLine as AnimateUiIconComponent,
    ),
  "chart-no-axes-column": () =>
    import("@/components/animate-ui/icons/chart-no-axes-column").then(
      (mod) => mod.ChartNoAxesColumn as AnimateUiIconComponent,
    ),
  "chart-no-axes-column-decreasing": () =>
    import("@/components/animate-ui/icons/chart-no-axes-column-decreasing").then(
      (mod) => mod.ChartNoAxesColumnDecreasing as AnimateUiIconComponent,
    ),
  "chart-no-axes-column-increasing": () =>
    import("@/components/animate-ui/icons/chart-no-axes-column-increasing").then(
      (mod) => mod.ChartNoAxesColumnIncreasing as AnimateUiIconComponent,
    ),
  "chart-scatter": () =>
    import("@/components/animate-ui/icons/chart-scatter").then(
      (mod) => mod.ChartScatter as AnimateUiIconComponent,
    ),
  "chart-spline": () =>
    import("@/components/animate-ui/icons/chart-spline").then(
      (mod) => mod.ChartSpline as AnimateUiIconComponent,
    ),
  "check": () =>
    import("@/components/animate-ui/icons/check").then(
      (mod) => mod.Check as AnimateUiIconComponent,
    ),
  "check-check": () =>
    import("@/components/animate-ui/icons/check-check").then(
      (mod) => mod.CheckCheck as AnimateUiIconComponent,
    ),
  "check-line": () =>
    import("@/components/animate-ui/icons/check-line").then(
      (mod) => mod.CheckLine as AnimateUiIconComponent,
    ),
  "cherry": () =>
    import("@/components/animate-ui/icons/cherry").then(
      (mod) => mod.Cherry as AnimateUiIconComponent,
    ),
  "chevron-down": () =>
    import("@/components/animate-ui/icons/chevron-down").then(
      (mod) => mod.ChevronDown as AnimateUiIconComponent,
    ),
  "chevron-left": () =>
    import("@/components/animate-ui/icons/chevron-left").then(
      (mod) => mod.ChevronLeft as AnimateUiIconComponent,
    ),
  "chevron-left-right": () =>
    import("@/components/animate-ui/icons/chevron-left-right").then(
      (mod) => mod.ChevronLeftRight as AnimateUiIconComponent,
    ),
  "chevron-right": () =>
    import("@/components/animate-ui/icons/chevron-right").then(
      (mod) => mod.ChevronRight as AnimateUiIconComponent,
    ),
  "chevron-up": () =>
    import("@/components/animate-ui/icons/chevron-up").then(
      (mod) => mod.ChevronUp as AnimateUiIconComponent,
    ),
  "chevron-up-down": () =>
    import("@/components/animate-ui/icons/chevron-up-down").then(
      (mod) => mod.ChevronUpDown as AnimateUiIconComponent,
    ),
  "circle-check": () =>
    import("@/components/animate-ui/icons/circle-check").then(
      (mod) => mod.CircleCheck as AnimateUiIconComponent,
    ),
  "circle-check-big": () =>
    import("@/components/animate-ui/icons/circle-check-big").then(
      (mod) => mod.CircleCheckBig as AnimateUiIconComponent,
    ),
  "circle-plus": () =>
    import("@/components/animate-ui/icons/circle-plus").then(
      (mod) => mod.CirclePlus as AnimateUiIconComponent,
    ),
  "circle-x": () =>
    import("@/components/animate-ui/icons/circle-x").then(
      (mod) => mod.CircleX as AnimateUiIconComponent,
    ),
  "circuit-board": () =>
    import("@/components/animate-ui/icons/circuit-board").then(
      (mod) => mod.CircuitBoard as AnimateUiIconComponent,
    ),
  "clapperboard": () =>
    import("@/components/animate-ui/icons/clapperboard").then(
      (mod) => mod.Clapperboard as AnimateUiIconComponent,
    ),
  "clipboard": () =>
    import("@/components/animate-ui/icons/clipboard").then(
      (mod) => mod.Clipboard as AnimateUiIconComponent,
    ),
  "clipboard-check": () =>
    import("@/components/animate-ui/icons/clipboard-check").then(
      (mod) => mod.ClipboardCheck as AnimateUiIconComponent,
    ),
  "clipboard-list": () =>
    import("@/components/animate-ui/icons/clipboard-list").then(
      (mod) => mod.ClipboardList as AnimateUiIconComponent,
    ),
  "clock": () =>
    import("@/components/animate-ui/icons/clock").then(
      (mod) => mod.Clock as AnimateUiIconComponent,
    ),
  "clock-1": () =>
    import("@/components/animate-ui/icons/clock-1").then(
      (mod) => mod.Clock1 as AnimateUiIconComponent,
    ),
  "clock-10": () =>
    import("@/components/animate-ui/icons/clock-10").then(
      (mod) => mod.Clock10 as AnimateUiIconComponent,
    ),
  "clock-11": () =>
    import("@/components/animate-ui/icons/clock-11").then(
      (mod) => mod.Clock11 as AnimateUiIconComponent,
    ),
  "clock-12": () =>
    import("@/components/animate-ui/icons/clock-12").then(
      (mod) => mod.Clock12 as AnimateUiIconComponent,
    ),
  "clock-2": () =>
    import("@/components/animate-ui/icons/clock-2").then(
      (mod) => mod.Clock2 as AnimateUiIconComponent,
    ),
  "clock-3": () =>
    import("@/components/animate-ui/icons/clock-3").then(
      (mod) => mod.Clock3 as AnimateUiIconComponent,
    ),
  "clock-4": () =>
    import("@/components/animate-ui/icons/clock-4").then(
      (mod) => mod.Clock4 as AnimateUiIconComponent,
    ),
  "clock-5": () =>
    import("@/components/animate-ui/icons/clock-5").then(
      (mod) => mod.Clock5 as AnimateUiIconComponent,
    ),
  "clock-6": () =>
    import("@/components/animate-ui/icons/clock-6").then(
      (mod) => mod.Clock6 as AnimateUiIconComponent,
    ),
  "clock-7": () =>
    import("@/components/animate-ui/icons/clock-7").then(
      (mod) => mod.Clock7 as AnimateUiIconComponent,
    ),
  "clock-8": () =>
    import("@/components/animate-ui/icons/clock-8").then(
      (mod) => mod.Clock8 as AnimateUiIconComponent,
    ),
  "clock-9": () =>
    import("@/components/animate-ui/icons/clock-9").then(
      (mod) => mod.Clock9 as AnimateUiIconComponent,
    ),
  "cloud-download": () =>
    import("@/components/animate-ui/icons/cloud-download").then(
      (mod) => mod.CloudDownload as AnimateUiIconComponent,
    ),
  "cloud-drizzle": () =>
    import("@/components/animate-ui/icons/cloud-drizzle").then(
      (mod) => mod.CloudDrizzle as AnimateUiIconComponent,
    ),
  "cloud-hail": () =>
    import("@/components/animate-ui/icons/cloud-hail").then(
      (mod) => mod.CloudHail as AnimateUiIconComponent,
    ),
  "cloud-lightning": () =>
    import("@/components/animate-ui/icons/cloud-lightning").then(
      (mod) => mod.CloudLightning as AnimateUiIconComponent,
    ),
  "cloud-moon": () =>
    import("@/components/animate-ui/icons/cloud-moon").then(
      (mod) => mod.CloudMoon as AnimateUiIconComponent,
    ),
  "cloud-moon-rain": () =>
    import("@/components/animate-ui/icons/cloud-moon-rain").then(
      (mod) => mod.CloudMoonRain as AnimateUiIconComponent,
    ),
  "cloud-rain": () =>
    import("@/components/animate-ui/icons/cloud-rain").then(
      (mod) => mod.CloudRain as AnimateUiIconComponent,
    ),
  "cloud-rain-wind": () =>
    import("@/components/animate-ui/icons/cloud-rain-wind").then(
      (mod) => mod.CloudRainWind as AnimateUiIconComponent,
    ),
  "cloud-snow": () =>
    import("@/components/animate-ui/icons/cloud-snow").then(
      (mod) => mod.CloudSnow as AnimateUiIconComponent,
    ),
  "cloud-sun": () =>
    import("@/components/animate-ui/icons/cloud-sun").then(
      (mod) => mod.CloudSun as AnimateUiIconComponent,
    ),
  "cloud-sun-rain": () =>
    import("@/components/animate-ui/icons/cloud-sun-rain").then(
      (mod) => mod.CloudSunRain as AnimateUiIconComponent,
    ),
  "cloud-upload": () =>
    import("@/components/animate-ui/icons/cloud-upload").then(
      (mod) => mod.CloudUpload as AnimateUiIconComponent,
    ),
  "cog": () =>
    import("@/components/animate-ui/icons/cog").then(
      (mod) => mod.Cog as AnimateUiIconComponent,
    ),
  "compass": () =>
    import("@/components/animate-ui/icons/compass").then(
      (mod) => mod.Compass as AnimateUiIconComponent,
    ),
  "contrast": () =>
    import("@/components/animate-ui/icons/contrast").then(
      (mod) => mod.Contrast as AnimateUiIconComponent,
    ),
  "copy": () =>
    import("@/components/animate-ui/icons/copy").then(
      (mod) => mod.Copy as AnimateUiIconComponent,
    ),
  "crop": () =>
    import("@/components/animate-ui/icons/crop").then(
      (mod) => mod.Crop as AnimateUiIconComponent,
    ),
  "cross": () =>
    import("@/components/animate-ui/icons/cross").then(
      (mod) => mod.Cross as AnimateUiIconComponent,
    ),
  "disc-3": () =>
    import("@/components/animate-ui/icons/disc-3").then(
      (mod) => mod.Disc3 as AnimateUiIconComponent,
    ),
  "download": () =>
    import("@/components/animate-ui/icons/download").then(
      (mod) => mod.Download as AnimateUiIconComponent,
    ),
  "ellipsis": () =>
    import("@/components/animate-ui/icons/ellipsis").then(
      (mod) => mod.Ellipsis as AnimateUiIconComponent,
    ),
  "ellipsis-vertical": () =>
    import("@/components/animate-ui/icons/ellipsis-vertical").then(
      (mod) => mod.EllipsisVertical as AnimateUiIconComponent,
    ),
  "equal-not": () =>
    import("@/components/animate-ui/icons/equal-not").then(
      (mod) => mod.EqualNot as AnimateUiIconComponent,
    ),
  "ev-charger": () =>
    import("@/components/animate-ui/icons/ev-charger").then(
      (mod) => mod.EvCharger as AnimateUiIconComponent,
    ),
  "expand": () =>
    import("@/components/animate-ui/icons/expand").then(
      (mod) => mod.Expand as AnimateUiIconComponent,
    ),
  "external-link": () =>
    import("@/components/animate-ui/icons/external-link").then(
      (mod) => mod.ExternalLink as AnimateUiIconComponent,
    ),
  "fan": () =>
    import("@/components/animate-ui/icons/fan").then(
      (mod) => mod.Fan as AnimateUiIconComponent,
    ),
  "fingerprint": () =>
    import("@/components/animate-ui/icons/fingerprint").then(
      (mod) => mod.Fingerprint as AnimateUiIconComponent,
    ),
  "forklift": () =>
    import("@/components/animate-ui/icons/forklift").then(
      (mod) => mod.Forklift as AnimateUiIconComponent,
    ),
  "frame": () =>
    import("@/components/animate-ui/icons/frame").then(
      (mod) => mod.Frame as AnimateUiIconComponent,
    ),
  "gallery-horizontal": () =>
    import("@/components/animate-ui/icons/gallery-horizontal").then(
      (mod) => mod.GalleryHorizontal as AnimateUiIconComponent,
    ),
  "gallery-horizontal-end": () =>
    import("@/components/animate-ui/icons/gallery-horizontal-end").then(
      (mod) => mod.GalleryVerticalEnd as AnimateUiIconComponent,
    ),
  "gallery-vertical": () =>
    import("@/components/animate-ui/icons/gallery-vertical").then(
      (mod) => mod.GalleryVertical as AnimateUiIconComponent,
    ),
  "gallery-vertical-end": () =>
    import("@/components/animate-ui/icons/gallery-vertical-end").then(
      (mod) => mod.GalleryHorizontalEnd as AnimateUiIconComponent,
    ),
  "gauge": () =>
    import("@/components/animate-ui/icons/gauge").then(
      (mod) => mod.Gauge as AnimateUiIconComponent,
    ),
  "gavel": () =>
    import("@/components/animate-ui/icons/gavel").then(
      (mod) => mod.Gavel as AnimateUiIconComponent,
    ),
  "hammer": () =>
    import("@/components/animate-ui/icons/hammer").then(
      (mod) => mod.Hammer as AnimateUiIconComponent,
    ),
  "heart": () =>
    import("@/components/animate-ui/icons/heart").then(
      (mod) => mod.Heart as AnimateUiIconComponent,
    ),
  "house-wifi": () =>
    import("@/components/animate-ui/icons/house-wifi").then(
      (mod) => mod.HouseWifi as AnimateUiIconComponent,
    ),
  "kanban": () =>
    import("@/components/animate-ui/icons/kanban").then(
      (mod) => mod.Kanban as AnimateUiIconComponent,
    ),
  "key": () =>
    import("@/components/animate-ui/icons/key").then(
      (mod) => mod.Key as AnimateUiIconComponent,
    ),
  "layers": () =>
    import("@/components/animate-ui/icons/layers").then(
      (mod) => mod.Layers as AnimateUiIconComponent,
    ),
  "layers-2": () =>
    import("@/components/animate-ui/icons/layers-2").then(
      (mod) => mod.Layers2 as AnimateUiIconComponent,
    ),
  "layout-dashboard": () =>
    import("@/components/animate-ui/icons/layout-dashboard").then(
      (mod) => mod.LayoutDashboard as AnimateUiIconComponent,
    ),
  "lightbulb": () =>
    import("@/components/animate-ui/icons/lightbulb").then(
      (mod) => mod.Lightbulb as AnimateUiIconComponent,
    ),
  "lightbulb-off": () =>
    import("@/components/animate-ui/icons/lightbulb-off").then(
      (mod) => mod.LightbulbOff as AnimateUiIconComponent,
    ),
  "link": () =>
    import("@/components/animate-ui/icons/link").then(
      (mod) => mod.Link as AnimateUiIconComponent,
    ),
  "link-2": () =>
    import("@/components/animate-ui/icons/link-2").then(
      (mod) => mod.Link2 as AnimateUiIconComponent,
    ),
  "list": () =>
    import("@/components/animate-ui/icons/list").then(
      (mod) => mod.List as AnimateUiIconComponent,
    ),
  "loader": () =>
    import("@/components/animate-ui/icons/loader").then(
      (mod) => mod.Loader as AnimateUiIconComponent,
    ),
  "loader-circle": () =>
    import("@/components/animate-ui/icons/loader-circle").then(
      (mod) => mod.LoaderCircle as AnimateUiIconComponent,
    ),
  "loader-pinwheel": () =>
    import("@/components/animate-ui/icons/loader-pinwheel").then(
      (mod) => mod.LoaderPinwheel as AnimateUiIconComponent,
    ),
  "lock": () =>
    import("@/components/animate-ui/icons/lock").then(
      (mod) => mod.Lock as AnimateUiIconComponent,
    ),
  "lock-keyhole": () =>
    import("@/components/animate-ui/icons/lock-keyhole").then(
      (mod) => mod.LockKeyhole as AnimateUiIconComponent,
    ),
  "lock-keyhole-open": () =>
    import("@/components/animate-ui/icons/lock-keyhole-open").then(
      (mod) => mod.LockKeyholeOpen as AnimateUiIconComponent,
    ),
  "lock-open": () =>
    import("@/components/animate-ui/icons/lock-open").then(
      (mod) => mod.LockOpen as AnimateUiIconComponent,
    ),
  "log-in": () =>
    import("@/components/animate-ui/icons/log-in").then(
      (mod) => mod.LogIn as AnimateUiIconComponent,
    ),
  "log-out": () =>
    import("@/components/animate-ui/icons/log-out").then(
      (mod) => mod.LogOut as AnimateUiIconComponent,
    ),
  "map-pin": () =>
    import("@/components/animate-ui/icons/map-pin").then(
      (mod) => mod.MapPin as AnimateUiIconComponent,
    ),
  "map-pin-off": () =>
    import("@/components/animate-ui/icons/map-pin-off").then(
      (mod) => mod.MapPinOff as AnimateUiIconComponent,
    ),
  "maximize": () =>
    import("@/components/animate-ui/icons/maximize").then(
      (mod) => mod.Maximize as AnimateUiIconComponent,
    ),
  "menu": () =>
    import("@/components/animate-ui/icons/menu").then(
      (mod) => mod.Menu as AnimateUiIconComponent,
    ),
  "message-circle": () =>
    import("@/components/animate-ui/icons/message-circle").then(
      (mod) => mod.MessageCircle as AnimateUiIconComponent,
    ),
  "message-circle-code": () =>
    import("@/components/animate-ui/icons/message-circle-code").then(
      (mod) => mod.MessageCircleCode as AnimateUiIconComponent,
    ),
  "message-circle-dashed": () =>
    import("@/components/animate-ui/icons/message-circle-dashed").then(
      (mod) => mod.MessageCircleDashed as AnimateUiIconComponent,
    ),
  "message-circle-heart": () =>
    import("@/components/animate-ui/icons/message-circle-heart").then(
      (mod) => mod.MessageCircleHeart as AnimateUiIconComponent,
    ),
  "message-circle-more": () =>
    import("@/components/animate-ui/icons/message-circle-more").then(
      (mod) => mod.MessageCircleMore as AnimateUiIconComponent,
    ),
  "message-circle-off": () =>
    import("@/components/animate-ui/icons/message-circle-off").then(
      (mod) => mod.MessageCircleOff as AnimateUiIconComponent,
    ),
  "message-circle-plus": () =>
    import("@/components/animate-ui/icons/message-circle-plus").then(
      (mod) => mod.MessageCirclePlus as AnimateUiIconComponent,
    ),
  "message-circle-question": () =>
    import("@/components/animate-ui/icons/message-circle-question").then(
      (mod) => mod.MessageCircleQuestion as AnimateUiIconComponent,
    ),
  "message-circle-warning": () =>
    import("@/components/animate-ui/icons/message-circle-warning").then(
      (mod) => mod.MessageCircleWarning as AnimateUiIconComponent,
    ),
  "message-circle-x": () =>
    import("@/components/animate-ui/icons/message-circle-x").then(
      (mod) => mod.MessageCircleX as AnimateUiIconComponent,
    ),
  "message-square": () =>
    import("@/components/animate-ui/icons/message-square").then(
      (mod) => mod.MessageSquare as AnimateUiIconComponent,
    ),
  "message-square-code": () =>
    import("@/components/animate-ui/icons/message-square-code").then(
      (mod) => mod.MessageSquareCode as AnimateUiIconComponent,
    ),
  "message-square-dashed": () =>
    import("@/components/animate-ui/icons/message-square-dashed").then(
      (mod) => mod.MessageSquareDashed as AnimateUiIconComponent,
    ),
  "message-square-diff": () =>
    import("@/components/animate-ui/icons/message-square-diff").then(
      (mod) => mod.MessageSquareDiff as AnimateUiIconComponent,
    ),
  "message-square-dot": () =>
    import("@/components/animate-ui/icons/message-square-dot").then(
      (mod) => mod.MessageSquareDot as AnimateUiIconComponent,
    ),
  "message-square-heart": () =>
    import("@/components/animate-ui/icons/message-square-heart").then(
      (mod) => mod.MessageSquareHeart as AnimateUiIconComponent,
    ),
  "message-square-more": () =>
    import("@/components/animate-ui/icons/message-square-more").then(
      (mod) => mod.MessageSquareMore as AnimateUiIconComponent,
    ),
  "message-square-off": () =>
    import("@/components/animate-ui/icons/message-square-off").then(
      (mod) => mod.MessageSquareOff as AnimateUiIconComponent,
    ),
  "message-square-plus": () =>
    import("@/components/animate-ui/icons/message-square-plus").then(
      (mod) => mod.MessageSquarePlus as AnimateUiIconComponent,
    ),
  "message-square-quote": () =>
    import("@/components/animate-ui/icons/message-square-quote").then(
      (mod) => mod.MessageSquareQuote as AnimateUiIconComponent,
    ),
  "message-square-share": () =>
    import("@/components/animate-ui/icons/message-square-share").then(
      (mod) => mod.MessageSquareShare as AnimateUiIconComponent,
    ),
  "message-square-text": () =>
    import("@/components/animate-ui/icons/message-square-text").then(
      (mod) => mod.MessageSquareText as AnimateUiIconComponent,
    ),
  "message-square-warning": () =>
    import("@/components/animate-ui/icons/message-square-warning").then(
      (mod) => mod.MessageSquareWarning as AnimateUiIconComponent,
    ),
  "message-square-x": () =>
    import("@/components/animate-ui/icons/message-square-x").then(
      (mod) => mod.MessageSquareX as AnimateUiIconComponent,
    ),
  "minimize": () =>
    import("@/components/animate-ui/icons/minimize").then(
      (mod) => mod.Minimize as AnimateUiIconComponent,
    ),
  "moon": () =>
    import("@/components/animate-ui/icons/moon").then(
      (mod) => mod.Moon as AnimateUiIconComponent,
    ),
  "moon-star": () =>
    import("@/components/animate-ui/icons/moon-star").then(
      (mod) => mod.MoonStar as AnimateUiIconComponent,
    ),
  "move-down": () =>
    import("@/components/animate-ui/icons/move-down").then(
      (mod) => mod.MoveDown as AnimateUiIconComponent,
    ),
  "move-left": () =>
    import("@/components/animate-ui/icons/move-left").then(
      (mod) => mod.MoveLeft as AnimateUiIconComponent,
    ),
  "move-right": () =>
    import("@/components/animate-ui/icons/move-right").then(
      (mod) => mod.MoveRight as AnimateUiIconComponent,
    ),
  "move-up": () =>
    import("@/components/animate-ui/icons/move-up").then(
      (mod) => mod.MoveUp as AnimateUiIconComponent,
    ),
  "nfc": () =>
    import("@/components/animate-ui/icons/nfc").then(
      (mod) => mod.Nfc as AnimateUiIconComponent,
    ),
  "orbit": () =>
    import("@/components/animate-ui/icons/orbit").then(
      (mod) => mod.Orbit as AnimateUiIconComponent,
    ),
  "paintbrush": () =>
    import("@/components/animate-ui/icons/paintbrush").then(
      (mod) => mod.Paintbrush as AnimateUiIconComponent,
    ),
  "panel-bottom": () =>
    import("@/components/animate-ui/icons/panel-bottom").then(
      (mod) => mod.PanelBottom as AnimateUiIconComponent,
    ),
  "panel-bottom-close": () =>
    import("@/components/animate-ui/icons/panel-bottom-close").then(
      (mod) => mod.PanelBottomClose as AnimateUiIconComponent,
    ),
  "panel-bottom-open": () =>
    import("@/components/animate-ui/icons/panel-bottom-open").then(
      (mod) => mod.PanelBottomOpen as AnimateUiIconComponent,
    ),
  "panel-left": () =>
    import("@/components/animate-ui/icons/panel-left").then(
      (mod) => mod.PanelLeft as AnimateUiIconComponent,
    ),
  "panel-left-close": () =>
    import("@/components/animate-ui/icons/panel-left-close").then(
      (mod) => mod.PanelLeftClose as AnimateUiIconComponent,
    ),
  "panel-left-open": () =>
    import("@/components/animate-ui/icons/panel-left-open").then(
      (mod) => mod.PanelLeftOpen as AnimateUiIconComponent,
    ),
  "panel-right": () =>
    import("@/components/animate-ui/icons/panel-right").then(
      (mod) => mod.PanelRight as AnimateUiIconComponent,
    ),
  "panel-right-close": () =>
    import("@/components/animate-ui/icons/panel-right-close").then(
      (mod) => mod.PanelRightClose as AnimateUiIconComponent,
    ),
  "panel-right-open": () =>
    import("@/components/animate-ui/icons/panel-right-open").then(
      (mod) => mod.PanelRightOpen as AnimateUiIconComponent,
    ),
  "panel-top": () =>
    import("@/components/animate-ui/icons/panel-top").then(
      (mod) => mod.PanelTop as AnimateUiIconComponent,
    ),
  "panel-top-close": () =>
    import("@/components/animate-ui/icons/panel-top-close").then(
      (mod) => mod.PanelTopClose as AnimateUiIconComponent,
    ),
  "panel-top-open": () =>
    import("@/components/animate-ui/icons/panel-top-open").then(
      (mod) => mod.PanelTopOpen as AnimateUiIconComponent,
    ),
  "paperclip": () =>
    import("@/components/animate-ui/icons/paperclip").then(
      (mod) => mod.Paperclip as AnimateUiIconComponent,
    ),
  "party-popper": () =>
    import("@/components/animate-ui/icons/party-popper").then(
      (mod) => mod.PartyPopper as AnimateUiIconComponent,
    ),
  "pause": () =>
    import("@/components/animate-ui/icons/pause").then(
      (mod) => mod.Pause as AnimateUiIconComponent,
    ),
  "phone-call": () =>
    import("@/components/animate-ui/icons/phone-call").then(
      (mod) => mod.PhoneCall as AnimateUiIconComponent,
    ),
  "pickaxe": () =>
    import("@/components/animate-ui/icons/pickaxe").then(
      (mod) => mod.Pickaxe as AnimateUiIconComponent,
    ),
  "pin": () =>
    import("@/components/animate-ui/icons/pin").then(
      (mod) => mod.Pin as AnimateUiIconComponent,
    ),
  "pin-off": () =>
    import("@/components/animate-ui/icons/pin-off").then(
      (mod) => mod.PinOff as AnimateUiIconComponent,
    ),
  "play": () =>
    import("@/components/animate-ui/icons/play").then(
      (mod) => mod.Play as AnimateUiIconComponent,
    ),
  "plug-zap": () =>
    import("@/components/animate-ui/icons/plug-zap").then(
      (mod) => mod.PlugZap as AnimateUiIconComponent,
    ),
  "plus": () =>
    import("@/components/animate-ui/icons/plus").then(
      (mod) => mod.Plus as AnimateUiIconComponent,
    ),
  "radio": () =>
    import("@/components/animate-ui/icons/radio").then(
      (mod) => mod.Radio as AnimateUiIconComponent,
    ),
  "radio-tower": () =>
    import("@/components/animate-ui/icons/radio-tower").then(
      (mod) => mod.RadioTower as AnimateUiIconComponent,
    ),
  "refresh-ccw": () =>
    import("@/components/animate-ui/icons/refresh-ccw").then(
      (mod) => mod.RefreshCcw as AnimateUiIconComponent,
    ),
  "refresh-ccw-dot": () =>
    import("@/components/animate-ui/icons/refresh-ccw-dot").then(
      (mod) => mod.RefreshCcw as AnimateUiIconComponent,
    ),
  "refresh-cw": () =>
    import("@/components/animate-ui/icons/refresh-cw").then(
      (mod) => mod.RefreshCw as AnimateUiIconComponent,
    ),
  "refresh-cw-off": () =>
    import("@/components/animate-ui/icons/refresh-cw-off").then(
      (mod) => mod.RefreshCwOff as AnimateUiIconComponent,
    ),
  "rotate-ccw": () =>
    import("@/components/animate-ui/icons/rotate-ccw").then(
      (mod) => mod.RotateCcw as AnimateUiIconComponent,
    ),
  "rotate-ccw-key": () =>
    import("@/components/animate-ui/icons/rotate-ccw-key").then(
      (mod) => mod.RotateCcwKey as AnimateUiIconComponent,
    ),
  "rotate-cw": () =>
    import("@/components/animate-ui/icons/rotate-cw").then(
      (mod) => mod.RotateCw as AnimateUiIconComponent,
    ),
  "route": () =>
    import("@/components/animate-ui/icons/route").then(
      (mod) => mod.Route as AnimateUiIconComponent,
    ),
  "router": () =>
    import("@/components/animate-ui/icons/router").then(
      (mod) => mod.Router as AnimateUiIconComponent,
    ),
  "scissors": () =>
    import("@/components/animate-ui/icons/scissors").then(
      (mod) => mod.Scissors as AnimateUiIconComponent,
    ),
  "scissors-line-dashed": () =>
    import("@/components/animate-ui/icons/scissors-line-dashed").then(
      (mod) => mod.ScissorsLineDashed as AnimateUiIconComponent,
    ),
  "search": () =>
    import("@/components/animate-ui/icons/search").then(
      (mod) => mod.Search as AnimateUiIconComponent,
    ),
  "send": () =>
    import("@/components/animate-ui/icons/send").then(
      (mod) => mod.Send as AnimateUiIconComponent,
    ),
  "send-horizontal": () =>
    import("@/components/animate-ui/icons/send-horizontal").then(
      (mod) => mod.SendHorizontal as AnimateUiIconComponent,
    ),
  "settings": () =>
    import("@/components/animate-ui/icons/settings").then(
      (mod) => mod.Settings as AnimateUiIconComponent,
    ),
  "shrink": () =>
    import("@/components/animate-ui/icons/shrink").then(
      (mod) => mod.Shrink as AnimateUiIconComponent,
    ),
  "signal": () =>
    import("@/components/animate-ui/icons/signal").then(
      (mod) => mod.Signal as AnimateUiIconComponent,
    ),
  "signal-high": () =>
    import("@/components/animate-ui/icons/signal-high").then(
      (mod) => mod.SignalHigh as AnimateUiIconComponent,
    ),
  "signal-low": () =>
    import("@/components/animate-ui/icons/signal-low").then(
      (mod) => mod.SignalLow as AnimateUiIconComponent,
    ),
  "signal-medium": () =>
    import("@/components/animate-ui/icons/signal-medium").then(
      (mod) => mod.SignalMedium as AnimateUiIconComponent,
    ),
  "signal-zero": () =>
    import("@/components/animate-ui/icons/signal-zero").then(
      (mod) => mod.SignalZero as AnimateUiIconComponent,
    ),
  "sliders-horizontal": () =>
    import("@/components/animate-ui/icons/sliders-horizontal").then(
      (mod) => mod.SlidersHorizontal as AnimateUiIconComponent,
    ),
  "sliders-vertical": () =>
    import("@/components/animate-ui/icons/sliders-vertical").then(
      (mod) => mod.SlidersVertical as AnimateUiIconComponent,
    ),
  "sparkle": () =>
    import("@/components/animate-ui/icons/sparkle").then(
      (mod) => mod.Sparkle as AnimateUiIconComponent,
    ),
  "sparkles": () =>
    import("@/components/animate-ui/icons/sparkles").then(
      (mod) => mod.Sparkles as AnimateUiIconComponent,
    ),
  "square-arrow-out-down-left": () =>
    import("@/components/animate-ui/icons/square-arrow-out-down-left").then(
      (mod) => mod.SquareArrowOutDownLeft as AnimateUiIconComponent,
    ),
  "square-arrow-out-down-right": () =>
    import("@/components/animate-ui/icons/square-arrow-out-down-right").then(
      (mod) => mod.SquareArrowOutDownRight as AnimateUiIconComponent,
    ),
  "square-arrow-out-up-left": () =>
    import("@/components/animate-ui/icons/square-arrow-out-up-left").then(
      (mod) => mod.SquareArrowOutUpLeft as AnimateUiIconComponent,
    ),
  "square-arrow-out-up-right": () =>
    import("@/components/animate-ui/icons/square-arrow-out-up-right").then(
      (mod) => mod.SquareArrowOutUpRight as AnimateUiIconComponent,
    ),
  "square-dashed-kanban": () =>
    import("@/components/animate-ui/icons/square-dashed-kanban").then(
      (mod) => mod.SquareDashedKanban as AnimateUiIconComponent,
    ),
  "square-kanban": () =>
    import("@/components/animate-ui/icons/square-kanban").then(
      (mod) => mod.SquareKanban as AnimateUiIconComponent,
    ),
  "square-plus": () =>
    import("@/components/animate-ui/icons/square-plus").then(
      (mod) => mod.SquarePlus as AnimateUiIconComponent,
    ),
  "square-x": () =>
    import("@/components/animate-ui/icons/square-x").then(
      (mod) => mod.SquareX as AnimateUiIconComponent,
    ),
  "star": () =>
    import("@/components/animate-ui/icons/star").then(
      (mod) => mod.Star as AnimateUiIconComponent,
    ),
  "sun": () =>
    import("@/components/animate-ui/icons/sun").then(
      (mod) => mod.Sun as AnimateUiIconComponent,
    ),
  "sun-dim": () =>
    import("@/components/animate-ui/icons/sun-dim").then(
      (mod) => mod.SunDim as AnimateUiIconComponent,
    ),
  "sun-medium": () =>
    import("@/components/animate-ui/icons/sun-medium").then(
      (mod) => mod.SunMedium as AnimateUiIconComponent,
    ),
  "sun-moon": () =>
    import("@/components/animate-ui/icons/sun-moon").then(
      (mod) => mod.SunMoon as AnimateUiIconComponent,
    ),
  "terminal": () =>
    import("@/components/animate-ui/icons/terminal").then(
      (mod) => mod.Terminal as AnimateUiIconComponent,
    ),
  "thumbs-down": () =>
    import("@/components/animate-ui/icons/thumbs-down").then(
      (mod) => mod.ThumbsDown as AnimateUiIconComponent,
    ),
  "thumbs-up": () =>
    import("@/components/animate-ui/icons/thumbs-up").then(
      (mod) => mod.ThumbsUp as AnimateUiIconComponent,
    ),
  "timer": () =>
    import("@/components/animate-ui/icons/timer").then(
      (mod) => mod.Timer as AnimateUiIconComponent,
    ),
  "timer-off": () =>
    import("@/components/animate-ui/icons/timer-off").then(
      (mod) => mod.TimerOff as AnimateUiIconComponent,
    ),
  "toggle-left": () =>
    import("@/components/animate-ui/icons/toggle-left").then(
      (mod) => mod.ToggleLeft as AnimateUiIconComponent,
    ),
  "toggle-right": () =>
    import("@/components/animate-ui/icons/toggle-right").then(
      (mod) => mod.ToggleRight as AnimateUiIconComponent,
    ),
  "trash": () =>
    import("@/components/animate-ui/icons/trash").then(
      (mod) => mod.Trash as AnimateUiIconComponent,
    ),
  "trash-2": () =>
    import("@/components/animate-ui/icons/trash-2").then(
      (mod) => mod.Trash2 as AnimateUiIconComponent,
    ),
  "unplug": () =>
    import("@/components/animate-ui/icons/unplug").then(
      (mod) => mod.Unplug as AnimateUiIconComponent,
    ),
  "upload": () =>
    import("@/components/animate-ui/icons/upload").then(
      (mod) => mod.Upload as AnimateUiIconComponent,
    ),
  "user": () =>
    import("@/components/animate-ui/icons/user").then(
      (mod) => mod.User as AnimateUiIconComponent,
    ),
  "user-round": () =>
    import("@/components/animate-ui/icons/user-round").then(
      (mod) => mod.UserRound as AnimateUiIconComponent,
    ),
  "users": () =>
    import("@/components/animate-ui/icons/users").then(
      (mod) => mod.Users as AnimateUiIconComponent,
    ),
  "users-round": () =>
    import("@/components/animate-ui/icons/users-round").then(
      (mod) => mod.UsersRound as AnimateUiIconComponent,
    ),
  "volume-1": () =>
    import("@/components/animate-ui/icons/volume-1").then(
      (mod) => mod.Volume1 as AnimateUiIconComponent,
    ),
  "volume-2": () =>
    import("@/components/animate-ui/icons/volume-2").then(
      (mod) => mod.Volume2 as AnimateUiIconComponent,
    ),
  "volume-off": () =>
    import("@/components/animate-ui/icons/volume-off").then(
      (mod) => mod.VolumeOff as AnimateUiIconComponent,
    ),
  "wifi": () =>
    import("@/components/animate-ui/icons/wifi").then(
      (mod) => mod.Wifi as AnimateUiIconComponent,
    ),
  "wifi-high": () =>
    import("@/components/animate-ui/icons/wifi-high").then(
      (mod) => mod.WifiHigh as AnimateUiIconComponent,
    ),
  "wifi-low": () =>
    import("@/components/animate-ui/icons/wifi-low").then(
      (mod) => mod.WifiLow as AnimateUiIconComponent,
    ),
  "wifi-zero": () =>
    import("@/components/animate-ui/icons/wifi-zero").then(
      (mod) => mod.WifiZero as AnimateUiIconComponent,
    ),
  "x": () =>
    import("@/components/animate-ui/icons/x").then(
      (mod) => mod.X as AnimateUiIconComponent,
    ),
}

export const ANIMATE_UI_ICON_NAMES = Object.keys(ANIMATE_UI_ICON_LOADERS)

/** Dodatkowe frazy do wyszukiwarki ikon w panelu administracyjnym. */
export const ANIMATE_UI_ICON_KEYWORDS: Record<string, string[]> = {
  "accessibility": ["disability","disabled","dda","wheelchair"],
  "activity": ["activity","pulse","action","motion","healthcare","fitness","medical","health","siesmic","magnitude","intensive care","hospital","emergency","ambulance","vitals","vital signs","heart rate monitor"],
  "airplay": ["stream","cast","mirroring","screen","monitor","macos","osx"],
  "alarm-clock": ["morning"],
  "arrow-down": ["arrow","down","backward","direction","south"],
  "arrow-left": ["arrow","left","back","previous","direction","west","<-"],
  "arrow-right": ["arrow","right","forward","next","direction","east","->"],
  "arrow-up": ["arrow","up","forward","direction","north"],
  "arrow-up-down": ["arrow","up","down","sort","direction","vertical"],
  "audio-lines": ["graphic equaliser","sound","noise","listen","hearing","hertz","frequency","wavelength","vibrate","sine","synthesizer","synthesiser","levels","track","music","playback","radio","broadcast","airwaves","voice","vocals","singer","song"],
  "axe": ["hatchet","weapon","chop","sharp","equipment","fireman","firefighter","brigade","lumberjack","woodcutter","logger","forestry"],
  "axis-3d": ["gizmo","coordinates"],
  "badge-check": ["verified","check"],
  "battery-charging": ["power","electricity","energy","accumulator","charge"],
  "battery-full": ["power","electricity","energy","accumulator","charge"],
  "battery-low": ["power","electricity","energy","accumulator","charge"],
  "battery-medium": ["power","electricity","energy","accumulator","charge"],
  "bell": ["alarm","notification","sound","reminder"],
  "bell-off": ["alarm","notification","sound","reminder"],
  "bell-ring": ["alarm","notification","sound","reminder"],
  "between-horizontal-end": ["insert","add","left","slot","squeeze","space","grid","table","rows","cells","excel","spreadsheet","accountancy","data","enter","entry","entries","blocks","rectangles","chevron","between","horizontal","end"],
  "between-horizontal-start": ["insert","add","right","slot","squeeze","space","grid","table","rows","cells","excel","spreadsheet","accountancy","data","enter","entry","entries","blocks","rectangles","chevron","between","horizontal","start"],
  "between-vertical-end": ["insert","add","down","slot","squeeze","space","grid","table","columns","cells","excel","spreadsheet","accountancy","data","enter","entry","entries","blocks","rectangles","chevron","between","vertical","end"],
  "between-vertical-start": ["insert","add","up","slot","squeeze","space","grid","table","columns","cells","excel","spreadsheet","accountancy","data","enter","entry","entries","blocks","rectangles","chevron","between","vertical","start"],
  "binary": ["code","digits","computer","zero","one","boolean"],
  "blend": ["mode","overlay","multiply","screen","opacity","transparency","alpha","filters","lenses","mixed","shades","tints","hues","saturation","brightness","overlap","colors","colours"],
  "blocks": ["addon","plugin","integration","extension","package","build","stack","toys","kids","children","learning","squares","corner"],
  "bot": ["robot","ai","chat","assistant"],
  "bot-message-square": ["robot","ai","chat","assistant"],
  "bot-off": ["robot","ai","chat","assistant"],
  "brush": ["clean","sweep","refactor","remove","draw","paint","color","artist"],
  "brush-cleaning": ["cleaning","utensil","housekeeping","tool","sweeping","scrubbing","hygiene","maintenance","household","cleaner","chores","equipment","sanitation","bristles","handle","home care","sanitize","purify","wash","disinfect","sterilize","scrub","polish","decontaminate","wipe","spotless","remove","empty","erase","purge","eliminate"],
  "cast": ["chromecast","airplay","screen"],
  "cctv": ["camera","surveillance","recording","film","videotape","crime","watching"],
  "chart-bar": ["statistics","analytics","diagram","graph"],
  "chart-bar-decreasing": ["statistics","analytics","diagram","graph","trending down"],
  "chart-bar-increasing": ["statistics","analytics","diagram","graph","trending up"],
  "chart-column": ["statistics","analytics","diagram","graph"],
  "chart-column-decreasing": ["statistics","analytics","diagram","graph","trending down"],
  "chart-column-increasing": ["statistics","analytics","diagram","graph","trending up"],
  "chart-line": ["statistics","analytics","diagram","graph"],
  "chart-no-axes-column": ["statistics","analytics","diagram","graph"],
  "chart-no-axes-column-decreasing": ["statistics","analytics","diagram","graph","trending down"],
  "chart-no-axes-column-increasing": ["statistics","analytics","diagram","graph","trending up"],
  "chart-scatter": ["statistics","analytics","diagram","graph"],
  "chart-spline": ["statistics","analytics","diagram","graph","curve","continuous","smooth","polynomial","quadratic","function","interpolation"],
  "check": ["done","todo","tick","complete","task"],
  "check-check": ["done","received","double","todo","tick","complete","task"],
  "check-line": ["done","todo","tick","complete","task"],
  "cherry": ["fruit","food"],
  "chevron-down": ["backwards","reverse","slow","dropdown"],
  "chevron-left": ["back","previous","less than","fewer","menu","<"],
  "chevron-left-right": ["expand","horizontal","unfold","<>"],
  "chevron-right": ["forward","next","more than","greater","menu","code","coding","command line","terminal","prompt","shell",">"],
  "chevron-up": ["caret","keyboard","mac","control","ctrl","superscript","exponential","power","ahead","fast","^","dropdown"],
  "chevron-up-down": ["expand","vertical","unfold"],
  "circle-check": ["done","todo","tick","complete","task"],
  "circle-check-big": ["done","todo","tick","complete","task"],
  "circle-plus": ["circle","plus","add","sum","addition","math","maths","new","+","increase","positive","calculate"],
  "circle-x": ["x","circle","cross","delete","close","cancel","remove","clear","math","multiply","multiplication"],
  "circuit-board": ["computing","electricity","electronics"],
  "clapperboard": ["movie","film","video","camera","cinema","cut","action","television","tv","show","entertainment"],
  "clipboard": ["copy","paste"],
  "clipboard-check": ["copied","pasted","done","todo","tick","complete","task"],
  "clipboard-list": ["copy","paste","task"],
  "clock": ["clock","time","watch","alarm","timer"],
  "clock-1": ["clock","time","watch","alarm","timer"],
  "clock-10": ["clock","time","watch","alarm","timer"],
  "clock-11": ["clock","time","watch","alarm","timer"],
  "clock-12": ["clock","time","watch","alarm","timer"],
  "clock-2": ["clock","time","watch","alarm","timer"],
  "clock-3": ["clock","time","watch","alarm","timer"],
  "clock-4": ["clock","time","watch","alarm","timer"],
  "clock-5": ["clock","time","watch","alarm","timer"],
  "clock-6": ["clock","time","watch","alarm","timer"],
  "clock-7": ["clock","time","watch","alarm","timer"],
  "clock-8": ["clock","time","watch","alarm","timer"],
  "clock-9": ["clock","time","watch","alarm","timer"],
  "cloud-download": ["import"],
  "cloud-drizzle": ["weather","shower"],
  "cloud-hail": ["weather","rainfall"],
  "cloud-lightning": ["weather","bolt"],
  "cloud-moon": ["weather","night"],
  "cloud-moon-rain": ["weather","partly","night","rainfall"],
  "cloud-rain": ["weather","rainfall"],
  "cloud-rain-wind": ["weather","rainfall"],
  "cloud-snow": ["weather","blizzard"],
  "cloud-sun": ["weather","partly"],
  "cloud-sun-rain": ["weather","partly","rainfall"],
  "cloud-upload": ["file"],
  "cog": ["computing","settings","cog","edit","gear","preferences","controls","configuration","fixed","build","construction","parts"],
  "compass": ["direction","north","south","east","west","safari","browser"],
  "contrast": ["display","accessibility"],
  "copy": ["clone","duplicate","multiple"],
  "crop": ["photo","image"],
  "cross": ["healthcare","first aid"],
  "disc-3": ["album","vinyl","record","cd","dvd","format","dj","spin","rotate","rpm"],
  "download": ["import","export","save"],
  "ellipsis": ["et cetera","etc","loader","loading","progress","pending","throbber","menu","options","operator","code","coding","spread","rest","more","further","extra","overflow","dots","…","..."],
  "ellipsis-vertical": ["menu","options","spread","more","further","extra","overflow","dots","…","..."],
  "equal-not": ["calculate","off","math","operator","code","≠"],
  "ev-charger": ["electric","charger","station","vehicle","fast","plug","ev","power","electricity","energy","accumulator","charge"],
  "expand": ["scale","fullscreen","maximize","minimize","contract"],
  "external-link": ["outbound","open","share"],
  "fan": ["air","cooler","ventilation","ventilator","blower"],
  "fingerprint": ["2fa","authentication","biometric","identity","security"],
  "forklift": ["vehicle","transport","logistics"],
  "frame": ["logo","design","tool"],
  "gallery-horizontal": ["layout","design","development","photography","multimedia","files"],
  "gallery-horizontal-end": ["layout","design","development","photography","multimedia","files"],
  "gallery-vertical": ["layout","design","development","photography","multimedia","files"],
  "gallery-vertical-end": ["layout","design","development","photography","multimedia","files"],
  "gauge": ["dashboard","dial","meter","speed","pressure","measure","level"],
  "gavel": ["mallet","hammer"],
  "hammer": ["mallet","nails","diy","toolbox","build","construction"],
  "heart": ["like","love","emotion","suit","playing","cards"],
  "house-wifi": ["home","living","building","wifi","connectivity"],
  "kanban": ["projects","manage","overview","board","tickets","issues","roadmap","plan","intentions","productivity","work","agile","code","coding"],
  "key": ["password","login","authentication","secure","unlock","keychain","key ring","fob"],
  "layers": ["stack","pile","pages","sheets","paperwork","copies","copy"],
  "layers-2": ["stack","pile","pages","sheets","paperwork","copies","copy","duplicate","double","shortcuts"],
  "layout-dashboard": ["masonry","brick"],
  "lightbulb": ["idea","bright","lights"],
  "lightbulb-off": ["lights"],
  "link": ["chain","url"],
  "link-2": ["link","connect","chain","url","relation","union","attach"],
  "list": ["options"],
  "loader": ["loading","wait","busy","progress","throbber","spinner","spinning"],
  "loader-circle": ["loading","wait","busy","progress","throbber","spinner","spinning","circle"],
  "loader-pinwheel": ["loading","wait","busy","progress","throbber","spinner","spinning","beach ball","frozen","freeze"],
  "lock": ["security","password","secure","admin"],
  "lock-keyhole": ["security","password","secure","admin"],
  "lock-keyhole-open": ["security"],
  "lock-open": ["security"],
  "log-in": ["sign in","arrow","enter","auth"],
  "log-out": ["sign out","arrow","exit","auth"],
  "map-pin": ["map","pin","location","waypoint","marker","drop"],
  "map-pin-off": ["location","waypoint","marker","remove"],
  "maximize": ["fullscreen","expand","dashed"],
  "menu": ["bars","navigation","hamburger","options"],
  "message-circle": ["comment","chat","conversation","dialog","feedback","speech bubble"],
  "message-circle-code": ["comment","chat","conversation","dialog","feedback","speech bubble","code review","coding"],
  "message-circle-dashed": ["comment","chat","conversation","dialog","feedback","speech bubble","draft"],
  "message-circle-heart": ["comment","chat","conversation","dialog","feedback","positive","like","love","interest","valentine","dating","date","speech bubble"],
  "message-circle-more": ["comment","chat","conversation","dialog","feedback","speech bubble","typing","writing","responding","ellipsis","etc","et cetera","..."],
  "message-circle-off": ["comment","chat","conversation","dialog","feedback","speech bubble","clear","close","delete","remove","cancel","silence","mute","moderate"],
  "message-circle-plus": ["comment","chat","conversation","dialog","feedback","speech bubble","add"],
  "message-circle-question": ["comment","chat","conversation","dialog","feedback","speech bubble","help"],
  "message-circle-warning": ["comment","chat","conversation","dialog","feedback","speech bubble","report","abuse","offense","alert","danger","caution","protected","exclamation mark"],
  "message-circle-x": ["comment","chat","conversation","dialog","feedback","speech bubble","clear","close","delete","remove","cancel","silence","mute","moderate"],
  "message-square": ["comment","chat","conversation","dialog","feedback","speech bubble"],
  "message-square-code": ["comment","chat","conversation","dialog","feedback","speech bubble","code review","coding"],
  "message-square-dashed": ["comment","chat","conversation","dialog","feedback","speech bubble","draft"],
  "message-square-diff": ["comment","chat","conversation","dialog","feedback","speech bubble","add","patch","difference","plus","minus","plus-minus","math","code review","coding","version control","git"],
  "message-square-dot": ["unread","unresolved","comment","chat","conversation","dialog","feedback","speech bubble"],
  "message-square-heart": ["comment","chat","conversation","dialog","feedback","positive","like","love","interest","valentine","dating","date","speech bubble"],
  "message-square-more": ["comment","chat","conversation","dialog","feedback","speech bubble","typing","writing","responding","ellipsis","etc","et cetera","..."],
  "message-square-off": ["comment","chat","conversation","dialog","feedback","speech bubble","clear","close","delete","remove","cancel","silence","mute","moderate"],
  "message-square-plus": ["comment","chat","conversation","dialog","feedback","speech bubble","add"],
  "message-square-quote": ["comment","chat","conversation","dialog","feedback","speech bubble","blockquote","quotation","indent","reply","response"],
  "message-square-share": ["comment","chat","conversation","dialog","feedback","speech bubble","network","forward"],
  "message-square-text": ["comment","chat","conversation","dialog","feedback","speech bubble"],
  "message-square-warning": ["comment","chat","conversation","dialog","feedback","speech bubble","report","abuse","offense","alert","danger","caution","protected","exclamation mark"],
  "message-square-x": ["comment","chat","conversation","dialog","feedback","speech bubble","clear","close","delete","remove","cancel","silence","mute","moderate"],
  "minimize": ["exit fullscreen","close","shrink"],
  "moon": ["dark","night"],
  "moon-star": ["dark","night","star"],
  "move-down": ["move","arrow","down","direction","south","↓"],
  "move-left": ["move","arrow","left","back","previous","direction","east","<-"],
  "move-right": ["move","arrow","right","forward","next","direction","east","->"],
  "move-up": ["move","arrow","up","direction","north","↑"],
  "nfc": ["contactless","payment","near-field","communication"],
  "orbit": ["planet","space","physics","satellites","moons"],
  "paintbrush": ["brush","paintbrush","design","color","colour","decoration","diy"],
  "panel-bottom": ["sidebar","panel","bottom","menu","drawer","navigation"],
  "panel-bottom-close": ["sidebar","panel","bottom","menu","drawer","navigation","close"],
  "panel-bottom-open": ["sidebar","panel","bottom","menu","drawer","navigation","open"],
  "panel-left": ["sidebar","panel","left","menu","drawer","navigation"],
  "panel-left-close": ["sidebar","panel","left","menu","drawer","navigation","close"],
  "panel-left-open": ["sidebar","panel","left","menu","drawer","navigation","open"],
  "panel-right": ["sidebar","panel","right","menu","drawer","navigation"],
  "panel-right-close": ["sidebar","panel","right","menu","drawer","navigation","close"],
  "panel-right-open": ["sidebar","panel","right","menu","drawer","navigation","open"],
  "panel-top": ["sidebar","panel","top","menu","drawer","navigation"],
  "panel-top-close": ["sidebar","panel","top","menu","drawer","navigation","close"],
  "panel-top-open": ["sidebar","panel","top","menu","drawer","navigation","open"],
  "paperclip": ["attachment","file"],
  "party-popper": ["emoji","congratulations","celebration","party","tada"," 🎉","🎊","excitement","exciting","excites","confetti"],
  "pause": ["music","stop"],
  "phone-call": ["phone","call","ring","audio","dial","contact","communication","voice","waves","signal"],
  "pickaxe": ["mining","mine","land worker","extraction","labor","construction","progress","advancement","crafting"],
  "pin": ["pin","map","location","lock","fixed","anchor"],
  "pin-off": ["unpin","map","unlock","unfix","unsave","remove"],
  "play": ["music","audio","video","start","run"],
  "plug-zap": ["electricity","energy","electronics","charge","charging","battery","connect"],
  "plus": ["plus","add","sum","addition","math","maths","new","+","increase","positive","calculate"],
  "radio": ["radio","tower","broadcast","airwaves","frequency","live"],
  "radio-tower": ["radio","tower","broadcast","airwaves","frequency","live"],
  "refresh-ccw": ["rotate","arrows","synchronise","reload","rerun","circular","cycle"],
  "refresh-ccw-dot": ["rotate","arrows","synchronise","reload","rerun","circular","cycle","issue","code","coding","version control"],
  "refresh-cw": ["rotate","arrows","synchronise","reload","rerun","circular","cycle"],
  "refresh-cw-off": ["rotate","arrows","synchronise","reload","rerun","circular","cycle","cancel","no","stop","error","disconnect","ignore"],
  "rotate-ccw": ["rotate","arrow","left","counter-clockwise","restart","reload","rerun","refresh","backup","undo","replay","redo","retry","rewind","reverse"],
  "rotate-ccw-key": ["password","key","refresh","change"],
  "rotate-cw": ["rotate","arrow","right","clockwise","refresh","reload","rerun","redo"],
  "route": ["path","journey","planner","points","stops","stations"],
  "router": ["computer","server","cloud"],
  "scissors": ["cut","snip","chop","stationery","crafts"],
  "scissors-line-dashed": ["cut here","along","snip","chop","stationery","crafts","instructions","diagram"],
  "search": ["find","scan","magnifier","magnifying glass","lens"],
  "send": ["send","email","message","mail","paper aeroplane","submit"],
  "send-horizontal": ["send","email","message","mail","paper aeroplane","submit"],
  "settings": ["cog","edit","gear","preferences"],
  "shrink": ["scale","fullscreen","maximize","minimize","contract"],
  "signal": ["connection","wireless","gsm","phone","2g","3g","4g","5g"],
  "signal-high": ["connection","wireless","gsm","phone","2g","3g","4g","5g"],
  "signal-low": ["connection","wireless","gsm","phone","2g","3g","4g","5g"],
  "signal-medium": ["connection","wireless","gsm","phone","2g","3g","4g","5g"],
  "signal-zero": ["connection","wireless","gsm","phone","2g","3g","4g","5g"],
  "sliders-horizontal": ["settings","filters","controls"],
  "sliders-vertical": ["settings","controls"],
  "sparkle": ["star","effect","filter","night","magic","shiny","glitter","twinkle","celebration"],
  "sparkles": ["stars","effect","filter","night","magic"],
  "square-arrow-out-down-left": ["outwards","direction","south-west","diagonal"],
  "square-arrow-out-down-right": ["outwards","direction","south-east","diagonal"],
  "square-arrow-out-up-left": ["outwards","direction","north-west","diagonal"],
  "square-arrow-out-up-right": ["outwards","direction","north-east","diagonal","share","open","external","link"],
  "square-dashed-kanban": ["projects","manage","overview","board","tickets","issues","roadmap","plan","intentions","productivity","work","agile","code","coding"],
  "square-kanban": ["projects","manage","overview","board","tickets","issues","roadmap","plan","intentions","productivity","work","agile","code","coding"],
  "square-plus": ["square","rect","plus","add","sum","addition","math","maths","new","+","increase","positive","calculate"],
  "square-x": ["square","x","cross","delete","close","cancel","remove","clear","math","multiply","multiplication"],
  "star": ["bookmark","favorite","like","review","rating"],
  "sun": ["brightness","weather","light","summer"],
  "sun-dim": ["brightness","dim","low","brightness low"],
  "sun-medium": ["brightness","medium"],
  "sun-moon": ["dark","light","moon","sun","brightness","theme","auto theme","system theme","appearance"],
  "terminal": ["code","command line","prompt","shell"],
  "thumbs-down": ["dislike","bad","emotion"],
  "thumbs-up": ["like","good","emotion"],
  "timer": ["time","timer","stopwatch"],
  "timer-off": ["time","timer","stopwatch"],
  "toggle-left": ["on","off","switch","boolean"],
  "toggle-right": ["on","off","switch","boolean"],
  "trash": ["garbage","delete","remove","bin"],
  "trash-2": ["garbage","delete","remove","bin"],
  "unplug": ["electricity","energy","electronics","socket","outlet","disconnect"],
  "upload": ["file"],
  "user": ["person","account","contact"],
  "user-round": ["person","account","contact"],
  "users": ["group","people"],
  "users-round": ["group","people"],
  "volume-1": ["music","sound","speaker"],
  "volume-2": ["music","sound","speaker"],
  "volume-off": ["music","sound","mute","speaker"],
  "wifi": ["connection","signal","wireless"],
  "wifi-high": ["connection","signal","wireless"],
  "wifi-low": ["connection","signal","wireless"],
  "wifi-zero": ["connection","signal","wireless"],
  "x": ["cross","x","delete","close","cancel","remove","clear","math","multiply","multiplication"],
}

/**
 * Odpowiednik z Lucide — rysowany zanim doładuje się animowana wersja ikony
 * (ikony Animate UI to animowane ikony Lucide, więc podmiana jest niewidoczna).
 */
export const ANIMATE_UI_LUCIDE_EQUIVALENTS: Record<string, string> = {
  "accessibility": "Accessibility",
  "activity": "Activity",
  "airplay": "Airplay",
  "alarm-clock": "AlarmClock",
  "arrow-down": "ArrowDown",
  "arrow-left": "ArrowLeft",
  "arrow-right": "ArrowRight",
  "arrow-up": "ArrowUp",
  "arrow-up-down": "ArrowUpDown",
  "audio-lines": "AudioLines",
  "axe": "Axe",
  "axis-3d": "Axis3d",
  "badge-check": "BadgeCheck",
  "battery-charging": "BatteryCharging",
  "battery-full": "BatteryFull",
  "battery-low": "BatteryLow",
  "battery-medium": "BatteryMedium",
  "bell": "Bell",
  "bell-off": "BellOff",
  "bell-ring": "BellRing",
  "between-horizontal-end": "BetweenHorizontalEnd",
  "between-horizontal-start": "BetweenHorizontalStart",
  "between-vertical-end": "BetweenVerticalEnd",
  "between-vertical-start": "BetweenVerticalStart",
  "binary": "Binary",
  "blend": "Blend",
  "blocks": "Blocks",
  "bot": "Bot",
  "bot-message-square": "BotMessageSquare",
  "bot-off": "BotOff",
  "brush": "Brush",
  "brush-cleaning": "BrushCleaning",
  "cast": "Cast",
  "cctv": "Cctv",
  "chart-bar": "ChartBar",
  "chart-bar-decreasing": "ChartBarDecreasing",
  "chart-bar-increasing": "ChartBarIncreasing",
  "chart-column": "ChartColumn",
  "chart-column-decreasing": "ChartColumnDecreasing",
  "chart-column-increasing": "ChartColumnIncreasing",
  "chart-line": "ChartLine",
  "chart-no-axes-column": "ChartNoAxesColumn",
  "chart-no-axes-column-decreasing": "ChartNoAxesColumnDecreasing",
  "chart-no-axes-column-increasing": "ChartNoAxesColumnIncreasing",
  "chart-scatter": "ChartScatter",
  "chart-spline": "ChartSpline",
  "check": "Check",
  "check-check": "CheckCheck",
  "check-line": "CheckLine",
  "cherry": "Cherry",
  "chevron-down": "ChevronDown",
  "chevron-left": "ChevronLeft",
  "chevron-left-right": "ChevronsLeftRight",
  "chevron-right": "ChevronRight",
  "chevron-up": "ChevronUp",
  "chevron-up-down": "ChevronsUpDown",
  "circle-check": "CircleCheck",
  "circle-check-big": "CircleCheckBig",
  "circle-plus": "CirclePlus",
  "circle-x": "CircleX",
  "circuit-board": "CircuitBoard",
  "clapperboard": "Clapperboard",
  "clipboard": "Clipboard",
  "clipboard-check": "ClipboardCheck",
  "clipboard-list": "ClipboardList",
  "clock": "Clock",
  "clock-1": "Clock1",
  "clock-10": "Clock10",
  "clock-11": "Clock11",
  "clock-12": "Clock12",
  "clock-2": "Clock2",
  "clock-3": "Clock3",
  "clock-4": "Clock4",
  "clock-5": "Clock5",
  "clock-6": "Clock6",
  "clock-7": "Clock7",
  "clock-8": "Clock8",
  "clock-9": "Clock9",
  "cloud-download": "CloudDownload",
  "cloud-drizzle": "CloudDrizzle",
  "cloud-hail": "CloudHail",
  "cloud-lightning": "CloudLightning",
  "cloud-moon": "CloudMoon",
  "cloud-moon-rain": "CloudMoonRain",
  "cloud-rain": "CloudRain",
  "cloud-rain-wind": "CloudRainWind",
  "cloud-snow": "CloudSnow",
  "cloud-sun": "CloudSun",
  "cloud-sun-rain": "CloudSunRain",
  "cloud-upload": "CloudUpload",
  "cog": "Cog",
  "compass": "Compass",
  "contrast": "Contrast",
  "copy": "Copy",
  "crop": "Crop",
  "cross": "Cross",
  "disc-3": "Disc3",
  "download": "Download",
  "ellipsis": "Ellipsis",
  "ellipsis-vertical": "EllipsisVertical",
  "equal-not": "EqualNot",
  "ev-charger": "EvCharger",
  "expand": "Expand",
  "external-link": "ExternalLink",
  "fan": "Fan",
  "fingerprint": "FingerprintPattern",
  "forklift": "Forklift",
  "frame": "Frame",
  "gallery-horizontal": "GalleryHorizontal",
  "gallery-horizontal-end": "GalleryHorizontalEnd",
  "gallery-vertical": "GalleryVertical",
  "gallery-vertical-end": "GalleryVerticalEnd",
  "gauge": "Gauge",
  "gavel": "Gavel",
  "hammer": "Hammer",
  "heart": "Heart",
  "house-wifi": "HouseWifi",
  "kanban": "Kanban",
  "key": "Key",
  "layers": "Layers",
  "layers-2": "Layers2",
  "layout-dashboard": "LayoutDashboard",
  "lightbulb": "Lightbulb",
  "lightbulb-off": "LightbulbOff",
  "link": "Link",
  "link-2": "Link2",
  "list": "List",
  "loader": "Loader",
  "loader-circle": "LoaderCircle",
  "loader-pinwheel": "LoaderPinwheel",
  "lock": "Lock",
  "lock-keyhole": "LockKeyhole",
  "lock-keyhole-open": "LockKeyholeOpen",
  "lock-open": "LockOpen",
  "log-in": "LogIn",
  "log-out": "LogOut",
  "map-pin": "MapPin",
  "map-pin-off": "MapPinOff",
  "maximize": "Maximize",
  "menu": "Menu",
  "message-circle": "MessageCircle",
  "message-circle-code": "MessageCircleCode",
  "message-circle-dashed": "MessageCircleDashed",
  "message-circle-heart": "MessageCircleHeart",
  "message-circle-more": "MessageCircleMore",
  "message-circle-off": "MessageCircleOff",
  "message-circle-plus": "MessageCirclePlus",
  "message-circle-question": "MessageCircleQuestionMark",
  "message-circle-warning": "MessageCircleWarning",
  "message-circle-x": "MessageCircleX",
  "message-square": "MessageSquare",
  "message-square-code": "MessageSquareCode",
  "message-square-dashed": "MessageSquareDashed",
  "message-square-diff": "MessageSquareDiff",
  "message-square-dot": "MessageSquareDot",
  "message-square-heart": "MessageSquareHeart",
  "message-square-more": "MessageSquareMore",
  "message-square-off": "MessageSquareOff",
  "message-square-plus": "MessageSquarePlus",
  "message-square-quote": "MessageSquareQuote",
  "message-square-share": "MessageSquareShare",
  "message-square-text": "MessageSquareText",
  "message-square-warning": "MessageSquareWarning",
  "message-square-x": "MessageSquareX",
  "minimize": "Minimize",
  "moon": "Moon",
  "moon-star": "MoonStar",
  "move-down": "MoveDown",
  "move-left": "MoveLeft",
  "move-right": "MoveRight",
  "move-up": "MoveUp",
  "nfc": "Nfc",
  "orbit": "Orbit",
  "paintbrush": "Paintbrush",
  "panel-bottom": "PanelBottom",
  "panel-bottom-close": "PanelBottomClose",
  "panel-bottom-open": "PanelBottomOpen",
  "panel-left": "PanelLeft",
  "panel-left-close": "PanelLeftClose",
  "panel-left-open": "PanelLeftOpen",
  "panel-right": "PanelRight",
  "panel-right-close": "PanelRightClose",
  "panel-right-open": "PanelRightOpen",
  "panel-top": "PanelTop",
  "panel-top-close": "PanelTopClose",
  "panel-top-open": "PanelTopOpen",
  "paperclip": "Paperclip",
  "party-popper": "PartyPopper",
  "pause": "Pause",
  "phone-call": "PhoneCall",
  "pickaxe": "Pickaxe",
  "pin": "Pin",
  "pin-off": "PinOff",
  "play": "Play",
  "plug-zap": "PlugZap",
  "plus": "Plus",
  "radio": "Radio",
  "radio-tower": "RadioTower",
  "refresh-ccw": "RefreshCcw",
  "refresh-ccw-dot": "RefreshCcwDot",
  "refresh-cw": "RefreshCw",
  "refresh-cw-off": "RefreshCwOff",
  "rotate-ccw": "RotateCcw",
  "rotate-ccw-key": "RotateCcwKey",
  "rotate-cw": "RotateCw",
  "route": "Route",
  "router": "Router",
  "scissors": "Scissors",
  "scissors-line-dashed": "ScissorsLineDashed",
  "search": "Search",
  "send": "Send",
  "send-horizontal": "SendHorizontal",
  "settings": "Settings",
  "shrink": "Shrink",
  "signal": "Signal",
  "signal-high": "SignalHigh",
  "signal-low": "SignalLow",
  "signal-medium": "SignalMedium",
  "signal-zero": "SignalZero",
  "sliders-horizontal": "SlidersHorizontal",
  "sliders-vertical": "SlidersVertical",
  "sparkle": "Sparkle",
  "sparkles": "Sparkles",
  "square-arrow-out-down-left": "SquareArrowOutDownLeft",
  "square-arrow-out-down-right": "SquareArrowOutDownRight",
  "square-arrow-out-up-left": "SquareArrowOutUpLeft",
  "square-arrow-out-up-right": "SquareArrowOutUpRight",
  "square-dashed-kanban": "SquareDashedKanban",
  "square-kanban": "SquareKanban",
  "square-plus": "SquarePlus",
  "square-x": "SquareX",
  "star": "Star",
  "sun": "Sun",
  "sun-dim": "SunDim",
  "sun-medium": "SunMedium",
  "sun-moon": "SunMoon",
  "terminal": "Terminal",
  "thumbs-down": "ThumbsDown",
  "thumbs-up": "ThumbsUp",
  "timer": "Timer",
  "timer-off": "TimerOff",
  "toggle-left": "ToggleLeft",
  "toggle-right": "ToggleRight",
  "trash": "Trash",
  "trash-2": "Trash2",
  "unplug": "Unplug",
  "upload": "Upload",
  "user": "User",
  "user-round": "UserRound",
  "users": "Users",
  "users-round": "UsersRound",
  "volume-1": "Volume1",
  "volume-2": "Volume2",
  "volume-off": "VolumeOff",
  "wifi": "Wifi",
  "wifi-high": "WifiHigh",
  "wifi-low": "WifiLow",
  "wifi-zero": "WifiZero",
  "x": "X",
}
