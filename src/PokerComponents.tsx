import { Card, Suit } from 'phevaluatorjs25'
import './Components.scss'
import { JSX, Match, Switch } from "solid-js"

const suit_long = (suit: Suit) => {
    switch (suit) {
        case 'd': return 'diamonds'
        case 'h': return 'hearts'
        case 'c': return 'clubs'
        case 's': return 'spades'
    }
}

export const SuitView = (props: { suit: Suit }) => {

    return (<>
        <div class={'suit'}>
            <svg width="100%" height="100%" viewBox="0 0 512 512">
                <Switch>

                <Match when={props.suit === 's'}>
                    <path d="M282.483,361.931L282.483,361.931c0,0,44.323,44.323,79.448-8.828c18.282-27.666,5.888-54.616-13.603-73.242    l-83.906-82.635c-4.723-4.025-11.979-4.025-16.711,0l-85.124,82.635c-16.746,17.523-31.011,45.506-12.518,73.242    c35.31,52.966,79.448,8.828,79.448,8.828c0,22.625-6.444,51.703-8.324,59.683c-0.256,1.112,0.6,2.11,1.739,2.11h66.145    c1.139,0,1.986-0.997,1.73-2.101C288.936,413.617,282.483,384.415,282.483,361.931" />
                </Match>
                <Match when={props.suit === 'd'}>
                    <polygon points="256,176.552 150.069,308.966 256,441.379 361.931,308.966   " />
                </Match>
                <Match when={props.suit === 'h'}>
                    <path d="M256,238.345c9.507-24.214,29.625-44.138,54.881-44.138c21.257,0,40.201,9.993,52.966,26.483    c16.013,20.692,27.33,66.754-7.715,101.8C338.353,340.268,256,423.724,256,423.724s-82.353-83.456-100.131-101.235    c-35.046-35.046-23.729-81.108-7.715-101.8c12.765-16.49,31.709-26.483,52.966-26.483    C226.375,194.207,246.493,214.131,256,238.345"/>
                </Match>
                <Match when={props.suit === 'c'}>
                    <path d="M282.482,370.759c0,21.91,6.047,43.82,8.13,50.732c0.344,1.139-0.521,2.233-1.704,2.233h-65.827    c-1.183,0-2.039-1.095-1.704-2.225c2.074-6.947,8.139-29.096,8.139-50.741c-8.722,6.321-18.803,9.578-29.917,9.578    c-32.274,0-60.275-27.101-58.253-59.78c1.13-18.379,12.835-34.145,28.425-43.926c15.651-9.825,30.164-10.611,43.14-7.459    c-8.298-9.825-13.312-22.502-13.312-36.361c0-34.834,31.576-62.296,67.663-55.314c22.59,4.361,40.545,22.925,44.332,45.612    c2.948,17.602-2.304,33.986-12.5,46.062c13.065-3.169,27.692-2.348,43.467,7.662c15.519,9.852,27.18,25.582,28.248,43.926    c1.889,32.591-26.2,59.577-58.403,59.577C301.444,380.337,291.045,376.947,282.482,370.759"/>
                </Match>
                </Switch>
            </svg>
        </div>
    </>)
}

export const CardView = (props: { card: Card }) => {

    let [rank, suit] = props.card.split('')
    rank = rank.replace('T', '10')


    return (<>
    <div class='card back'>
      <div class='inner'>
        <div class={'front decoration ' + suit_long(suit)}>
               <div class='rank'>{rank}</div>
               <div class='suit-left'> <SuitView suit={suit} /> </div>
               <div class='suit-middle'> <SuitView suit={suit} /> </div>
        </div>
        <div class='back'></div>
      </div>
    </div>
    </>)
}


export const Hand = () => {
    return (<>
    <div class='hand'>
        <CardView card="Th"/>
        <CardView card="Jc"/>
    </div>
    </>)
}

export const Showcase = () => {
    return (<>
    
    <div class='showcase'>
        <ShowcaseSection header='Card'>
            <>
              <div class='hands'>
                  <Hand/>
              </div>
            </>
        </ShowcaseSection>
    </div>

    </>)
}

const ShowcaseSection = (props: { header: string, children: JSX.Element }) => {
    return (<>
    <section>
        <h2>{props.header}</h2>
        <div class='area'>
            {props.children}
        </div>
    </section>
    </>)
}
