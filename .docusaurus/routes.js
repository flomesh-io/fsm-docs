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
    component: ComponentCreator('/fsm-docs/docs', '4e3'),
    routes: [
      {
        path: '/fsm-docs/docs/',
        component: ComponentCreator('/fsm-docs/docs/', '845'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/api-references/intro',
        component: ComponentCreator('/fsm-docs/docs/api-references/intro', '6f4'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/architecture',
        component: ComponentCreator('/fsm-docs/docs/architecture', '468'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/category/api-references',
        component: ComponentCreator('/fsm-docs/docs/category/api-references', '5ec'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/category/demos',
        component: ComponentCreator('/fsm-docs/docs/category/demos', '96b'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/category/getting-started',
        component: ComponentCreator('/fsm-docs/docs/category/getting-started', '54f'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/category/how-to-guides',
        component: ComponentCreator('/fsm-docs/docs/category/how-to-guides', 'e0b'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/category/ingress-controller',
        component: ComponentCreator('/fsm-docs/docs/category/ingress-controller', '8a3'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/category/multi-cluster',
        component: ComponentCreator('/fsm-docs/docs/category/multi-cluster', '56f'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/category/overview',
        component: ComponentCreator('/fsm-docs/docs/category/overview', '1b5'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/category/releases',
        component: ComponentCreator('/fsm-docs/docs/category/releases', '8e2'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/demos/intro',
        component: ComponentCreator('/fsm-docs/docs/demos/intro', '19c'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/getting-started/intro',
        component: ComponentCreator('/fsm-docs/docs/getting-started/intro', '2be'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/how-to/intro',
        component: ComponentCreator('/fsm-docs/docs/how-to/intro', '235'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/ingress/intro',
        component: ComponentCreator('/fsm-docs/docs/ingress/intro', '3f2'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/multi-cluster/intro',
        component: ComponentCreator('/fsm-docs/docs/multi-cluster/intro', 'fea'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/overview/intro',
        component: ComponentCreator('/fsm-docs/docs/overview/intro', 'dad'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/quick-start',
        component: ComponentCreator('/fsm-docs/docs/quick-start', '68b'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/releases/intro',
        component: ComponentCreator('/fsm-docs/docs/releases/intro', '5e2'),
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
