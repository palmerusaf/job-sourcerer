import * as icon from 'lucide-react';
import DiscordLogo from '/discord.svg';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import * as React from 'react';
import { Sidebar, SidebarContent, SidebarRail } from '@/components/ui/sidebar';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { useSidebarState } from '@/hooks/useSidebarState';

function _Layout({
  menu,
  submenu,
  children,
  menuData,
  setActive,
}: {
  menu: string;
  submenu: string;
  children?: React.ReactNode;
  menuData: MenuData[];
  setActive: React.Dispatch<
    React.SetStateAction<{
      menu: string;
      submenu: string;
    }>
  >;
}) {
  return (
    <SidebarProvider>
      <Sidebar collapsible='icon'>
        <SidebarContent className='flex justify-between'>
          <_NavMain setActive={setActive} items={menuData} />
          <div className='flex justify-center mb-2 w-full'>
            <a
              href='https://discord.gg/haNFYn8aje'
              className='flex gap-2 justify-center items-center font-bold'
            >
              <img src={DiscordLogo} className='h-4' />
              Discord
            </a>
          </div>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className='flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12'>
          <div className='flex gap-2 items-center px-4'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mr-2 h-4' />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className='hidden md:block'>
                  <BreadcrumbLink>{menu}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className='hidden md:block' />
                <BreadcrumbItem>
                  <BreadcrumbPage>{submenu}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
function _NavMain({
  items,
  setActive,
}: {
  items: {
    menu: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      subMenu: string;
      url: string;
    }[];
  }[];
  setActive: React.Dispatch<
    React.SetStateAction<{
      menu: string;
      submenu: string;
    }>
  >;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.menu}
            asChild
            defaultOpen={item.isActive}
            className='group/collapsible'
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  className='cursor-pointer'
                  tooltip={item.menu}
                >
                  {item.icon && <item.icon />}
                  <span>{item.menu}</span>
                  <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={item.menu + subItem.subMenu}>
                      <SidebarMenuSubButton asChild>
                        <button
                          className='cursor-pointer'
                          onClick={() =>
                            setActive({
                              menu: item.menu,
                              submenu: subItem.subMenu,
                            })
                          }
                        >
                          {subItem.subMenu}
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
export type MenuData = {
  menu: string;
  url: string;
  icon: React.ForwardRefExoticComponent<
    Omit<icon.LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >;
  isActive?: boolean;
  items: {
    subMenu: string;
    url: string;
    content: React.ReactNode;
  }[];
};
export const SideBar = ({ menuData }: { menuData: MenuData[] }) => {
  const defaultState = {
    menu: menuData[0].menu,
    submenu: menuData[0].items[0].subMenu,
  };
  const [active, setActive] = useSidebarState(defaultState);
  const pageContent = menuData
    .find((item) => item.menu === active.menu)
    ?.items.find((item) => item.subMenu === active.submenu)?.content;
  return (
    <_Layout
      setActive={setActive}
      menuData={menuData}
      menu={active.menu}
      submenu={active.submenu}
    >
      {pageContent}
    </_Layout>
  );
};
