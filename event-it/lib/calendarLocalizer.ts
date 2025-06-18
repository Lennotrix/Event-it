import {dateFnsLocalizer, DateFormat} from 'react-big-calendar'
import {
    format,
    parse,
    startOfWeek,
    getDay,
    isSameDay,
} from 'date-fns'
import {de, enUS} from "date-fns/locale";

const locales = {
    'en-US': enUS,
    'de-DE': de,
    'de': de
}

export const timeGutterFormat = (date: Date, culture: string, localizer: any) =>
    localizer.format(date, "HH:mm", culture)

export const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})
