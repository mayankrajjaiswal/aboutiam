import { useEffect, useState } from 'react'
import { Check, Copy, FileWarning } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import { decodePostBinding, decodeRedirectBinding, extractSamlFields, prettyPrintXml } from '../../lib/tools/saml'
import type { SamlFields } from '../../lib/tools/saml'

const tool = getToolBySlug('saml-decoder')!

// A small, self-contained demo SAMLResponse — fake IdP/SP hostnames and a
// fake user, generated locally, not captured from any real system.
const SAMPLE_POST_VALUE =
  'PHNhbWxwOlJlc3BvbnNlIHhtbG5zOnNhbWxwPSJ1cm46b2FzaXM6bmFtZXM6dGM6U0FNTDoyLjA6cHJvdG9jb2wiIHhtbG5zOnNhbWw9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjIuMDphc3NlcnRpb24iIElEPSJfcmVzcDEyMyIgSXNzdWVJbnN0YW50PSIyMDI2LTA3LTAyVDE1OjAwOjAwWiIgVmVyc2lvbj0iMi4wIj48c2FtbDpJc3N1ZXI+aHR0cHM6Ly9pZHAuYWJvdXRpYW0ubG9jYWwvc2FtbDwvc2FtbDpJc3N1ZXI+PHNhbWxwOlN0YXR1cz48c2FtbHA6U3RhdHVzQ29kZSBWYWx1ZT0idXJuOm9hc2lzOm5hbWVzOnRjOlNBTUw6Mi4wOnN0YXR1czpTdWNjZXNzIi8+PC9zYW1scDpTdGF0dXM+PHNhbWw6QXNzZXJ0aW9uIElEPSJfYXNzZXJ0NDU2IiBJc3N1ZUluc3RhbnQ9IjIwMjYtMDctMDJUMTU6MDA6MDBaIiBWZXJzaW9uPSIyLjAiPjxzYW1sOklzc3Vlcj5odHRwczovL2lkcC5hYm91dGlhbS5sb2NhbC9zYW1sPC9zYW1sOklzc3Vlcj48c2FtbDpTdWJqZWN0PjxzYW1sOk5hbWVJRCBGb3JtYXQ9InVybjpvYXNpczpuYW1lczp0YzpTQU1MOjEuMTpuYW1laWQtZm9ybWF0OmVtYWlsQWRkcmVzcyI+ZGVtby51c2VyQGFib3V0aWFtLmxvY2FsPC9zYW1sOk5hbWVJRD48L3NhbWw6U3ViamVjdD48c2FtbDpDb25kaXRpb25zIE5vdEJlZm9yZT0iMjAyNi0wNy0wMlQxNTowMDowMFoiIE5vdE9uT3JBZnRlcj0iMjAyNi0wNy0wMlQxNTowNTowMFoiPjxzYW1sOkF1ZGllbmNlUmVzdHJpY3Rpb24+PHNhbWw6QXVkaWVuY2U+aHR0cHM6Ly9zcC5hYm91dGlhbS5sb2NhbDwvc2FtbDpBdWRpZW5jZT48L3NhbWw6QXVkaWVuY2VSZXN0cmljdGlvbj48L3NhbWw6Q29uZGl0aW9ucz48c2FtbDpBdHRyaWJ1dGVTdGF0ZW1lbnQ+PHNhbWw6QXR0cmlidXRlIE5hbWU9ImVtYWlsIj48c2FtbDpBdHRyaWJ1dGVWYWx1ZT5kZW1vLnVzZXJAYWJvdXRpYW0ubG9jYWw8L3NhbWw6QXR0cmlidXRlVmFsdWU+PC9zYW1sOkF0dHJpYnV0ZT48c2FtbDpBdHRyaWJ1dGUgTmFtZT0icm9sZSI+PHNhbWw6QXR0cmlidXRlVmFsdWU+ZW5naW5lZXI8L3NhbWw6QXR0cmlidXRlVmFsdWU+PHNhbWw6QXR0cmlidXRlVmFsdWU+YmV0YS10ZXN0ZXI8L3NhbWw6QXR0cmlidXRlVmFsdWU+PC9zYW1sOkF0dHJpYnV0ZT48L3NhbWw6QXR0cmlidXRlU3RhdGVtZW50Pjwvc2FtbDpBc3NlcnRpb24+PC9zYW1scDpSZXNwb25zZT4='

const SAMPLE_REDIRECT_VALUE =
  'xVTRTuswDP2VKu9rs3IHUrRWDBDSJBgSQzzcF5S1HjeoiavYkfh81HabaKDcRx5tH/v4HDlZkrZNqx6BWnQEybttHKk+WYjgnUJNhpTTFkhxpbar+zuVp1K1HhkrbMSnlp87NBF4NuhEsr4pxIsHauf5mUjWRAHWjlg7LkQu8/OZvJjJ/Gm+UFIqKf+K5Bk8GXSFyFMpymXHpvo+X/5jbkllmanbVO8wsNE2bbDSTdbBltln8HLQu2XNgcbRNdaQPOsmwM86qEerbagqIBJZOTCMh6rVUe0gdhD/Z3H+C3LVNuzeoOJDtNEW1jfJLXqreVrqPJ33GVPP9j1UgdWmWdW172SXNVhMA4G/HG9xWGBgOXgTbXCNrjadN5RskK9gjx6mnNggP7gHv9oz+C+YRY85Oh5qA66CRyD2purmR5WTdxRbd1jzBIzi0cgs0nAkYfZmFxi6MwALjuNC0nlSiN5GERf7w/ufqRE6zk4Qemxggg/cq3EAfmL+d8kdsJ4xEE92fdkqmzQoG7+V01M6/kflBw=='

const SAMPLE_METADATA_XML =
  '<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="https://sp.aboutiam.local"><md:SPSSODescriptor AuthnRequestsSigned="true" WantAssertionsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol"><md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://sp.aboutiam.local/saml/acs" index="0"/></md:SPSSODescriptor></md:EntityDescriptor>'

type Tab = 'binding' | 'metadata'
type Binding = 'post' | 'redirect'

export default function SamlDecoder() {
  const [tab, setTab] = useState<Tab>('binding')
  const [binding, setBinding] = useState<Binding>('post')
  const [postInput, setPostInput] = useState(SAMPLE_POST_VALUE)
  const [redirectInput, setRedirectInput] = useState(SAMPLE_REDIRECT_VALUE)
  const [metadataInput, setMetadataInput] = useState(SAMPLE_METADATA_XML)
  const [xmlOut, setXmlOut] = useState('')
  const [fields, setFields] = useState<SamlFields | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { copy, copiedId } = useClipboardCopy()

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        if (tab === 'binding') {
          const value = binding === 'post' ? postInput : redirectInput
          const xml = binding === 'post' ? decodePostBinding(value) : await decodeRedirectBinding(value)
          if (cancelled) return
          setError(null)
          setXmlOut(prettyPrintXml(xml))
          setFields(extractSamlFields(xml))
        } else {
          setError(null)
          setXmlOut(prettyPrintXml(metadataInput))
          setFields(null)
        }
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Could not decode this value.')
        setXmlOut('')
        setFields(null)
      }
    }
    run()
    return () => { cancelled = true }
  }, [tab, binding, postInput, redirectInput, metadataInput])

  return (
    <ToolPageShell tool={tool}>
      <div className="inline-flex rounded-lg border border-border-subtle overflow-hidden">
        {([
          { id: 'binding' as Tab, label: 'SAMLRequest/Response' },
          { id: 'metadata' as Tab, label: 'Metadata XML' },
        ]).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${tab === id ? 'bg-accent-primary text-white' : 'bg-bg-card text-text-secondary hover:bg-bg-sidebar'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 min-w-0">
        <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-3 shadow-sm min-w-0">
          {tab === 'binding' ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Base64 Value</span>
                <div className="inline-flex rounded-lg border border-border-subtle overflow-hidden">
                  {([
                    { id: 'post' as Binding, label: 'POST' },
                    { id: 'redirect' as Binding, label: 'Redirect' },
                  ]).map(({ id, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setBinding(id)}
                      className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${binding === id ? 'bg-accent-secondary text-white' : 'bg-bg-card text-text-secondary hover:bg-bg-sidebar'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={binding === 'post' ? postInput : redirectInput}
                onChange={(e) => (binding === 'post' ? setPostInput(e.target.value) : setRedirectInput(e.target.value))}
                aria-label="SAMLRequest or SAMLResponse base64 value"
                className="w-full h-72 p-4 rounded-lg bg-bg-sidebar text-[11px] text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none break-all"
                spellCheck={false}
              />
            </>
          ) : (
            <>
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">SP / IdP Metadata XML</span>
              <textarea
                value={metadataInput}
                onChange={(e) => setMetadataInput(e.target.value)}
                aria-label="SAML metadata XML"
                className="w-full h-72 p-4 rounded-lg bg-bg-sidebar text-[11px] text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none break-all"
                spellCheck={false}
              />
            </>
          )}
        </div>

        <div className="space-y-4 min-w-0">
          {error && (
            <div className="p-5 rounded-xl bg-status-danger/5 border border-status-danger/20 flex items-start gap-3">
              <FileWarning className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary font-medium">{error}</p>
            </div>
          )}

          {!error && fields && (
            <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Key Assertion Fields</span>
              <FieldRow label="Issuer" value={fields.issuer} />
              <FieldRow label="NameID" value={fields.nameId} />
              <FieldRow label="Audience" value={fields.audience} />
              <FieldRow label="Not Before" value={fields.notBefore} />
              <FieldRow label="Not On Or After" value={fields.notOnOrAfter} />
              {fields.attributes.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Attribute Statement</span>
                  {fields.attributes.map((attr) => (
                    <div key={attr.name} className="flex flex-wrap gap-x-2 text-xs">
                      <span className="font-bold text-text-primary font-mono">{attr.name}:</span>
                      <span className="font-mono text-text-secondary break-all">{attr.values.join(', ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!error && xmlOut && (
            <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Pretty-Printed XML</span>
                <button type="button" onClick={() => copy(xmlOut, 'xml')} aria-label="Copy XML" className="text-text-muted hover:text-text-primary">
                  {copiedId === 'xml' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <pre className="w-full h-72 p-4 rounded-lg bg-bg-sidebar text-[11px] text-text-primary font-mono border border-border-subtle overflow-auto whitespace-pre">
                {xmlOut}
              </pre>
            </div>
          )}
        </div>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}

function FieldRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3 text-xs">
      <span className="font-bold text-text-muted uppercase tracking-wider shrink-0 sm:w-32">{label}</span>
      <span className="text-text-primary font-mono break-all">{value}</span>
    </div>
  )
}
