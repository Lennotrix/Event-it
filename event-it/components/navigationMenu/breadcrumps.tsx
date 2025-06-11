'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import {Fragment} from "react";

const breadcrumbNameMap: Record<string, string> = {
    friends: 'Freunde',
    groups: 'Gruppen',
    create: 'Erstellen',
    calendar: 'Kalendar',
    events: 'Events',
    settings: 'Einstellungen',
}

export function Breadcrumbs() {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean)

    const breadcrumbs = segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/')
        const name = breadcrumbNameMap[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

        return {
            name,
            href,
            isLast: index === segments.length - 1,
        }
    })

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {breadcrumbs.length > 0 && <BreadcrumbSeparator />}

                {breadcrumbs.map(({ name, href, isLast }, index) => (
                    <Fragment key={name}>
                        <BreadcrumbItem >
                            <BreadcrumbLink asChild>
                                <Link href={href} aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-foreground' : ''}>
                                    {name}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}