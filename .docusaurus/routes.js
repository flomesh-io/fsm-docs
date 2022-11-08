import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/fsm-docs/__docusaurus/debug',
    component: ComponentCreator('/fsm-docs/__docusaurus/debug', '15b'),
    exact: true
  },
  {
    path: '/fsm-docs/__docusaurus/debug/config',
    component: ComponentCreator('/fsm-docs/__docusaurus/debug/config', '6dc'),
    exact: true
  },
  {
    path: '/fsm-docs/__docusaurus/debug/content',
    component: ComponentCreator('/fsm-docs/__docusaurus/debug/content', 'dea'),
    exact: true
  },
  {
    path: '/fsm-docs/__docusaurus/debug/globalData',
    component: ComponentCreator('/fsm-docs/__docusaurus/debug/globalData', '050'),
    exact: true
  },
  {
    path: '/fsm-docs/__docusaurus/debug/metadata',
    component: ComponentCreator('/fsm-docs/__docusaurus/debug/metadata', 'c59'),
    exact: true
  },
  {
    path: '/fsm-docs/__docusaurus/debug/registry',
    component: ComponentCreator('/fsm-docs/__docusaurus/debug/registry', '33a'),
    exact: true
  },
  {
    path: '/fsm-docs/__docusaurus/debug/routes',
    component: ComponentCreator('/fsm-docs/__docusaurus/debug/routes', '4d2'),
    exact: true
  },
  {
    path: '/fsm-docs/markdown-page',
    component: ComponentCreator('/fsm-docs/markdown-page', '219'),
    exact: true
  },
  {
    path: '/fsm-docs/docs',
    component: ComponentCreator('/fsm-docs/docs', 'f56'),
    routes: [
      {
        path: '/fsm-docs/docs/category/tutorial---basics',
        component: ComponentCreator('/fsm-docs/docs/category/tutorial---basics', 'b23'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/category/tutorial---extras',
        component: ComponentCreator('/fsm-docs/docs/category/tutorial---extras', 'd58'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/intro',
        component: ComponentCreator('/fsm-docs/docs/intro', '0e7'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/tutorial-basics/congratulations',
        component: ComponentCreator('/fsm-docs/docs/tutorial-basics/congratulations', 'c87'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/tutorial-basics/create-a-blog-post',
        component: ComponentCreator('/fsm-docs/docs/tutorial-basics/create-a-blog-post', 'dcc'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/tutorial-basics/create-a-document',
        component: ComponentCreator('/fsm-docs/docs/tutorial-basics/create-a-document', '77f'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/tutorial-basics/create-a-page',
        component: ComponentCreator('/fsm-docs/docs/tutorial-basics/create-a-page', 'a80'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/tutorial-basics/deploy-your-site',
        component: ComponentCreator('/fsm-docs/docs/tutorial-basics/deploy-your-site', '955'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/tutorial-basics/markdown-features',
        component: ComponentCreator('/fsm-docs/docs/tutorial-basics/markdown-features', '7f6'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/tutorial-extras/manage-docs-versions',
        component: ComponentCreator('/fsm-docs/docs/tutorial-extras/manage-docs-versions', '9e8'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/tutorial-extras/translate-your-site',
        component: ComponentCreator('/fsm-docs/docs/tutorial-extras/translate-your-site', '2dc'),
        exact: true,
        sidebar: "tutorialSidebar"
      }
    ]
  },
  {
    path: '/fsm-docs/',
    component: ComponentCreator('/fsm-docs/', 'b5a'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
