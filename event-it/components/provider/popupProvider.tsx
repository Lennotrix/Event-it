// components/popup/PopupProvider.tsx
'use client'

import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog'
import { createContext, useContext, useState, ReactNode } from 'react'

type PopupContextType = {
    openPopup: (content: ReactNode) => void
    closePopup: () => void
}

const PopupContext = createContext<PopupContextType | undefined>(undefined)

export function usePopup() {
    const context = useContext(PopupContext)
    if (!context) throw new Error('usePopup must be used within a PopupProvider')
    return context
}

export function PopupProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [popupContent, setPopupContent] = useState<ReactNode>(null)

    const openPopup = (content: ReactNode) => {
        setPopupContent(content)
        setIsOpen(true)
    }

    const closePopup = () => {
        setIsOpen(false)
        setPopupContent(null)
    }

    return (
        <PopupContext.Provider value={{ openPopup, closePopup }}>
            {children}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    {popupContent}
                </DialogContent>
            </Dialog>
        </PopupContext.Provider>
    )
}
