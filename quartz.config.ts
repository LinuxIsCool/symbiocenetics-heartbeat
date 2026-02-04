import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "Regen Heartbeat",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "en-US",
    baseUrl: "gaiaaiagent.github.io/regen-heartbeat",
    ignorePatterns: ["private", "templates", ".obsidian", ".claude", "**/CLAUDE.md"],
    defaultDateType: "modified",
    theme: {
      fontOrigin: "googleFonts",
      cdnCaching: true,
      typography: {
        header: "Space Mono",
        body: "DM Sans",
        code: "JetBrains Mono",
      },
      colors: {
        lightMode: {
          light: "#F0F2F0",
          lightgray: "#D8DCD8",
          gray: "#8A9A8A",
          darkgray: "#2A3A2A",
          dark: "#0F1A0F",
          secondary: "#1A9A4A",
          tertiary: "#22C55E",
          highlight: "rgba(34, 197, 94, 0.08)",
          textHighlight: "rgba(34, 197, 94, 0.15)",
        },
        darkMode: {
          light: "#0A0A0A",
          lightgray: "#1A1A1A",
          gray: "#4A4A4A",
          darkgray: "#A3A3AF",
          dark: "#ECECEC",
          secondary: "#22C55E",
          tertiary: "#16A34A",
          highlight: "rgba(34, 197, 94, 0.10)",
          textHighlight: "rgba(34, 197, 94, 0.18)",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "vitesse-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
      Plugin.Latex({ renderEngine: "katex" }),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
    ],
  },
}

export default config
