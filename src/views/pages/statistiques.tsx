import React from 'react'
import { hydrate } from 'react-dom'
import { StatsDTO } from '../../modules/stats/StatsDTO'
import { VictoryChart, VictoryLine, VictoryTheme, VictoryCursorContainer } from 'victory'

interface Props extends StatsDTO {}

const ratio = (a: number, b: number) => (a && b ? `${Math.round((a / b) * 100)}%` : '0%')

interface CardProps {
  value: number | string
  title: string
  titleColor?: string
  isBig?: true
  subtitle?: {
    prefix?: string
    value: number | string
    suffix?: string
  }
}
const Card = ({ value, title, isBig, titleColor, subtitle }: CardProps) => (
  <div className="card">
    <div className="card__content">
      {isBig ? (
        <h1 style={{ color: 'var(--blue)', marginBottom: 0 }}>{value}</h1>
      ) : (
        <h2 style={{ color: titleColor || '', marginBottom: 0 }}>{value}</h2>
      )}
      <div className="card__meta">{title}</div>
      {subtitle ? (
        <div className="card__meta">
          {subtitle.prefix || ''}
          <h4 style={{ display: 'inline', margin: '0 5px' }}>{subtitle.value}</h4>
          {subtitle.suffix || ''}
        </div>
      ) : (
        ''
      )}
    </div>
  </div>
)

const DEMANDE_TITLE = {
  actionnaire: "Changement d'actionnaire",
  producteur: 'Changement de producteur',
  fournisseur: 'Changement de fournisseur',
  puissance: 'Changement de puissance',
  abandon: 'Abandon',
  recours: 'Recours',
  delai: 'Demande de délai',
}

/* Pure component */
export default function StatistiquesPages(props: Props) {
  return (
    <main role="main">
      <section className="section section-color">
        <div className="container">
          <div style={{ height: 300, width: 600 }}>
            <VictoryChart
              containerComponent={
                <VictoryCursorContainer
                  cursorLabel={(coords) => `${Math.round(coords.x)}, ${Math.round(coords.y)}`}
                />
              }
              theme={VictoryTheme.material}
            >
              <VictoryLine
                style={{
                  data: { stroke: '#c43a31' },
                  parent: { border: '1px solid #ccc' },
                }}
                data={[
                  { x: 1, y: 2 },
                  { x: 2, y: 3 },
                  { x: 3, y: 5 },
                  { x: 4, y: 4 },
                  { x: 5, y: 7 },
                ]}
              />
            </VictoryChart>
          </div>

          <h2 className="section__title">Potentiel en chiffres</h2>
          <p className="section__subtitle">Au service des porteurs de projets</p>

          <div className="row">
            <Card
              value={props.projetsTotal}
              isBig
              title="projets sur Potentiel"
              subtitle={{ prefix: 'dont', value: props.projetsLaureats, suffix: 'lauréats' }}
            />
            <Card
              value={props.porteursProjetNotifies}
              isBig
              title="porteurs de projets concernés"
            />
          </div>
        </div>
      </section>
      <section className="section section-grey">
        <div className="container">
          <h2>Utilisateurs</h2>

          <div className="row">
            <Card
              value={props.porteursProjetNotifiesInscrits}
              title="porteurs de projet"
              subtitle={{
                prefix: 'soit',
                value: ratio(props.porteursProjetNotifiesInscrits, props.porteursProjetNotifies),
              }}
            />
            <Card value={props.parrainages} title="parrainages" />
            <Card value={18} title="DREAL" subtitle={{ prefix: 'soit', value: '100%' }} />
          </div>

          <h2>Avancement des projets</h2>

          <div className="row">
            <Card
              value={props.telechargementsAttestation}
              titleColor="var(--theme-dark-text)"
              title="attestations téléchargées"
              subtitle={{
                prefix: 'soit',
                value: ratio(props.telechargementsAttestation, props.projetsAvecAttestation),
              }}
            />
            <Card
              value={props.gfDeposees}
              titleColor="var(--theme-dark-text)"
              title="GF déposées"
              subtitle={{ prefix: 'soit', value: ratio(props.gfDeposees, props.gfDues) }}
            />
            <Card
              value={props.dcrDeposees}
              titleColor="var(--theme-dark-text)"
              title="DCR déposées"
              subtitle={{ prefix: 'soit', value: ratio(props.dcrDeposees, props.dcrDues) }}
            />
          </div>

          <h2>Demandes</h2>

          <div className="row">
            {props.demandes &&
              Object.entries(props.demandes)
                .filter(([key, value]) => value)
                .map(([key, value]) => (
                  <Card value={value} title={DEMANDE_TITLE[key]} key={'demande_' + key} />
                ))}
          </div>
        </div>
      </section>
    </main>
  )
}

if (typeof window !== 'undefined') {
  const props = (window as any).__INITIAL_PROPS__
  hydrate(<StatistiquesPages {...props} />, document.querySelector('#root'))
}
