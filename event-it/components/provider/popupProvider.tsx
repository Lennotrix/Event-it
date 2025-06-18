// components/popup/PopupProvider.tsx
'use client'

import {
    Dialog,
    DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { createContext, useContext, useState, ReactNode } from 'react'

type PopupContextType = {
    openPopup: (content: ReactNode, title: string, description: string) => void
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
    const [title, setTitle] = useState('Popup Title')
    const [description, setDescription] = useState('Popup Description')

    const openPopup = (content: ReactNode, title: string, description: string) => {
        setPopupContent(content)
        setTitle(title)
        setDescription(description)
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
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>{description}</DialogDescription>
                    </DialogHeader>
                    {popupContent}
                </DialogContent>
            </Dialog>
        </PopupContext.Provider>
    )
}
