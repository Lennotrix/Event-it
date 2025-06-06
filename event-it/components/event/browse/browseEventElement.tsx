"use client"

import {Button} from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {format} from "date-fns"
import {de} from "date-fns/locale"
import {EventWithVenue} from "@/types/exposed";
import {ReactNode} from "react";


export function Eventelement({event,children}: { event: EventWithVenue,children: ReactNode }) {

    // Hilfsfunktion zur Formatierung
    const formatGermanDate = (isoString: string) => {
        try {
            const date = new Date(isoString)
            const formatted = format(date, "EEE',' dd.MMMM',' HH:mm", {locale: de})
            return formatted.replace(/^(\w{2}),/, "$1.") // z. B. "Do." statt "Do"
        } catch {
            return isoString
        }
    }

    return (
        <Card
            key={event.id}
            className=""
        >
            <CardHeader>
                <div className="relative">
                    <img
                        src={event.image_url?.toString()}
                        alt={event.name}
                        className="w-full h-40 object-cover rounded-t-md"
                    />
                </div>
                <CardTitle className="">
                    {event.name}
                </CardTitle>
                <CardDescription className="">
                    {formatGermanDate(event.start_time)}<br/>
                    {event.venues?.name}
                </CardDescription>
            </CardHeader>
            <CardContent className="">
                {event.description}
            </CardContent>
            <CardFooter className="">
                {children}
            </CardFooter>
        </Card>

    )
}