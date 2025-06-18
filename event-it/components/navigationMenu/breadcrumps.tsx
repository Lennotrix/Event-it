'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Fragment, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const breadcrumbNameMap: Record<string, string> = {
    friends: 'Freunde',
    groups: 'Gruppen',
    create: 'Erstellen',
    calendar: 'Kalendar',
    events: 'Events',
    settings: 'Einstellungen',
}

const clickableSegments = ['events', 'me', 'create']
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function Breadcrumbs() {
    const pathname = usePathname()
    const segments = pathname.split('/').filter(Boolean)
    const [dynamicNames, setDynamicNames] = useState<Record<string, string>>({})

    useEffect(() => {
        async function fetchDynamicNames() {
            const supabase = createClient()
            const newNames: Record<string, string> = {}

            for (const segment of segments) {
                if (uuidRegex.test(segment)) {
                    const { data, error } = await supabase
                        .from('friend_groups')
                        .select('name')
                        .eq('id', segment)
                        .single()

                    if (!error && data?.name) {
                        newNames[segment] = data.name
                    }
                }
            }
            setDynamicNames(newNames)
        }
        fetchDynamicNames()
    }, [pathname])

    const breadcrumbs = segments.map((segment, index) => {
        const href = '/' + segments.slice(0, index + 1).join('/')
        const name =
            dynamicNames[segment] ||
            breadcrumbNameMap[segment] ||
            segment.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

        return {
            name,
            href,
            segment,
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

                {breadcrumbs.map(({ name, href, isLast, segment }) => (
                    <Fragment key={href}>
                        <BreadcrumbItem>
                            {clickableSegments.includes(segment) && !isLast ? (
                                <BreadcrumbLink asChild>
                                    <Link href={href}>{name}</Link>
                                </BreadcrumbLink>
                            ) : (
                            <span className={isLast ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                            {name}
                            </span>
                            )}
                        </BreadcrumbItem>
                        {!isLast && <BreadcrumbSeparator />}
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
