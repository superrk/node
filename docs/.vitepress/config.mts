import { defineConfig } from "vitepress";
import fs from "fs";
import path from "path";

import matter from "gray-matter";

function generateSidebarWithFrontmatter(dir: string, basePath = "") {
  const sidebar: {
    text: any;
    collapsed?: boolean;
    items?: any[];
    link?: string;
    order?: any;
  }[] = [];
  const fullPath = path.resolve(dir);

  if (!fs.existsSync(fullPath)) return sidebar;

  const items = fs.readdirSync(fullPath);

  items.forEach((item) => {
    const itemPath = path.join(fullPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      const children = generateSidebarWithFrontmatter(
        itemPath,
        path.join(basePath, item)
      );
      if (children.length > 0) {
        sidebar.push({
          text: formatTitle(item),
          collapsed: false,
          items: children,
        });
      }
    } else if (item.endsWith(".md")) {
      const content = fs.readFileSync(itemPath, "utf-8");
      const { data } = matter(content);

      // 使用 frontmatter 中的标题
      const title = data.title || formatTitle(item.replace(".md", ""));
      const order = data.order || 0;

      if (item !== "index.md" || dir !== "./docs") {
        sidebar.push({
          text: title,
          link: basePath
            ? `/${basePath}/${item.replace(".md", "")}`
            : `/${item.replace(".md", "")}`,
          order: order,
        });
      }
    }
  });
  // 按 order 排序
  return sidebar.sort((a, b) => (a.order || 0) - (b.order || 0));
}
// 自动生成导航栏
function generateNav() {
  const nav: { text: string; link: string }[] = [];
  const docsDir = "./docs";
  const items = fs.readdirSync(docsDir);

  const mainSections = items.filter((item) => {
    const itemPath = path.join(docsDir, item);
    return fs.statSync(itemPath).isDirectory() && !item.startsWith(".");
  });

  mainSections.forEach((section) => {
    nav.push({
      text: formatTitle(section),
      link: `/${section}/`,
    });
  });

  return nav;
}
function formatTitle(str: string) {
  return str.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

// export default defineConfig({
//   themeConfig: {
//     nav: generateNav(),
//     sidebar: generateSidebarWithFrontmatter('./')
//   }
// })

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "请神中",
  description: "天花板",
  base: '/repo/',
  locales: {
    root: {
      label: '简体中文',
      lang: 'Zh_CN',
    }
  },
  themeConfig: {
    // // https://vitepress.dev/reference/default-theme-config
    sidebar: generateSidebarWithFrontmatter("./docs"),
    sidebarMenuLabel: '目录',
    outline:{
      label: '本页大纲'
    },
    socialLinks: [
      { icon: "gitee", link: "https://github.com/vuejs/vitepress" },
    ],
  },
});
