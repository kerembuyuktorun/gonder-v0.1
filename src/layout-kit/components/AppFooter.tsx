/**
 * Layout Kit - AppFooter
 * 
 * Dashboard footer bileşeni
 * - Marka bilgisi
 * - Link grupları
 * - Sosyal medya linkleri
 * - Copyright
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import type { AppFooterProps } from "../context/types"

export function AppFooter({
  brandName = "ARF Technology",
  copyright,
  description,
  linkGroups = [],
  socialLinks = [],
  className = "",
}: AppFooterProps) {
  const currentYear = new Date().getFullYear()
  const copyrightText = copyright || `© ${currentYear} ${brandName}. All rights reserved.`

  return (
    <footer className={`border-t bg-background ${className}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">{brandName}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex gap-2 pt-2">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon
                  return (
                    <Link
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex size-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      aria-label={social.label}
                    >
                      <Icon className="size-4" />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Link Groups */}
          {linkGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-3">
              <h4 className="text-sm font-semibold">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <Separator className="my-6" />
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-muted-foreground">
            {copyrightText}
          </p>
          {/* Optional: Privacy & Terms links */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
