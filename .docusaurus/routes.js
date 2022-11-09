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
    component: ComponentCreator('/fsm-docs/docs', '95c'),
    routes: [
      {
        path: '/fsm-docs/docs/',
        component: ComponentCreator('/fsm-docs/docs/', '845'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/api-references/cluster',
        component: ComponentCreator('/fsm-docs/docs/api-references/cluster', '3d7'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/api-references/globaltrafficpolicy',
        component: ComponentCreator('/fsm-docs/docs/api-references/globaltrafficpolicy', '32d'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/api-references/multiclusterendpoint',
        component: ComponentCreator('/fsm-docs/docs/api-references/multiclusterendpoint', '3b3'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/api-references/namespacedingress',
        component: ComponentCreator('/fsm-docs/docs/api-references/namespacedingress', '1b5'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/api-references/proxy',
        component: ComponentCreator('/fsm-docs/docs/api-references/proxy', 'd8f'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/api-references/proxyprofile',
        component: ComponentCreator('/fsm-docs/docs/api-references/proxyprofile', 'f66'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/api-references/serviceexport',
        component: ComponentCreator('/fsm-docs/docs/api-references/serviceexport', 'cdb'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/api-references/serviceimport',
        component: ComponentCreator('/fsm-docs/docs/api-references/serviceimport', 'e5c'),
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
        path: '/fsm-docs/docs/category/enable-features',
        component: ComponentCreator('/fsm-docs/docs/category/enable-features', 'd7d'),
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
        path: '/fsm-docs/docs/category/install',
        component: ComponentCreator('/fsm-docs/docs/category/install', 'a04'),
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
        path: '/fsm-docs/docs/category/single-cluster',
        component: ComponentCreator('/fsm-docs/docs/category/single-cluster', '183'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/category/tutorial',
        component: ComponentCreator('/fsm-docs/docs/category/tutorial', 'dea'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/demos/multi-cluster/intro',
        component: ComponentCreator('/fsm-docs/docs/demos/multi-cluster/intro', '2fd'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/demos/single-cluster/intro',
        component: ComponentCreator('/fsm-docs/docs/demos/single-cluster/intro', '652'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/getting-started/features/egress-gateway',
        component: ComponentCreator('/fsm-docs/docs/getting-started/features/egress-gateway', '9eb'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/getting-started/features/ingress-controller-and-gateway-api',
        component: ComponentCreator('/fsm-docs/docs/getting-started/features/ingress-controller-and-gateway-api', '33c'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/getting-started/features/integrate-with-flb',
        component: ComponentCreator('/fsm-docs/docs/getting-started/features/integrate-with-flb', 'a37'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/getting-started/features/logging-and-metrics',
        component: ComponentCreator('/fsm-docs/docs/getting-started/features/logging-and-metrics', '63b'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/getting-started/features/multicluster',
        component: ComponentCreator('/fsm-docs/docs/getting-started/features/multicluster', '83d'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/getting-started/features/namespacedingress',
        component: ComponentCreator('/fsm-docs/docs/getting-started/features/namespacedingress', 'a6e'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/getting-started/features/service-lb',
        component: ComponentCreator('/fsm-docs/docs/getting-started/features/service-lb', 'a23'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/getting-started/install/install-with-cli',
        component: ComponentCreator('/fsm-docs/docs/getting-started/install/install-with-cli', '309'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/getting-started/install/install-with-helm',
        component: ComponentCreator('/fsm-docs/docs/getting-started/install/install-with-helm', '733'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/getting-started/install/install-with-static-yaml',
        component: ComponentCreator('/fsm-docs/docs/getting-started/install/install-with-static-yaml', '611'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/getting-started/install/prerequisites',
        component: ComponentCreator('/fsm-docs/docs/getting-started/install/prerequisites', '4bc'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/getting-started/setup-flomesh-gui',
        component: ComponentCreator('/fsm-docs/docs/getting-started/setup-flomesh-gui', '920'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/getting-started/uninstall',
        component: ComponentCreator('/fsm-docs/docs/getting-started/uninstall', '1ce'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/overview/architecture',
        component: ComponentCreator('/fsm-docs/docs/overview/architecture', 'e2a'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/overview/concepts',
        component: ComponentCreator('/fsm-docs/docs/overview/concepts', '0f1'),
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
        path: '/fsm-docs/docs/releases/feature-lifecycle',
        component: ComponentCreator('/fsm-docs/docs/releases/feature-lifecycle', 'ed1'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/releases/histrory',
        component: ComponentCreator('/fsm-docs/docs/releases/histrory', '34e'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/tutorial/certificate-management',
        component: ComponentCreator('/fsm-docs/docs/tutorial/certificate-management', 'b89'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/tutorial/egress-gateway',
        component: ComponentCreator('/fsm-docs/docs/tutorial/egress-gateway', '54f'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/tutorial/ingress-controller-and-gateway-api',
        component: ComponentCreator('/fsm-docs/docs/tutorial/ingress-controller-and-gateway-api', '4c4'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/tutorial/integrate-with-flb',
        component: ComponentCreator('/fsm-docs/docs/tutorial/integrate-with-flb', 'a44'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/tutorial/multicluster',
        component: ComponentCreator('/fsm-docs/docs/tutorial/multicluster', 'e0c'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/tutorial/namespacedingress',
        component: ComponentCreator('/fsm-docs/docs/tutorial/namespacedingress', 'ef1'),
        exact: true,
        sidebar: "tutorialSidebar"
      },
      {
        path: '/fsm-docs/docs/tutorial/service-lb',
        component: ComponentCreator('/fsm-docs/docs/tutorial/service-lb', '105'),
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
