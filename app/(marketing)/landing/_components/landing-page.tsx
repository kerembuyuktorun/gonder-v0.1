'use client'

import { QuoteProvider } from './quote-context'
import { LandingNav } from './landing-nav'
import { LandingHero } from './landing-hero'
import { TrustStrip } from './trust-strip'
import { ModulesSection } from './modules-section'
import { HowItWorks } from './how-it-works'
import { QuoteNetworkSection } from './quote-network-section'
import { FeaturesSection } from './features-section'
import { NetworkMapSection } from './network-map-section'
import { IntegrationsSection } from './integrations-section'
import { AssistantSection } from './assistant-section'
import { BusinessCta } from './business-cta'
import { FaqSection } from './faq-section'
import { FinalCta } from './final-cta'
import { LandingFooter } from './landing-footer'

export function LandingPage() {
  return (
    <QuoteProvider>
      <LandingNav />
      <main>
        <LandingHero />
        <TrustStrip />
        <ModulesSection />
        <HowItWorks />
        <QuoteNetworkSection />
        <FeaturesSection />
        <NetworkMapSection />
        <IntegrationsSection />
        <AssistantSection />
        <BusinessCta />
        <FaqSection />
        <FinalCta />
      </main>
      <LandingFooter />
    </QuoteProvider>
  )
}
