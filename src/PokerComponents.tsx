import { Card, Suit } from 'phevaluatorjs25'
import './Components.scss'
import { Accessor, batch, createEffect, createMemo, createSignal, Index, JSX, Match, on, onCleanup, Show, Switch } from "solid-js"

const side_klass = ['one', 'two', 'three', 'four', 'five', 'six']

const bet_klass = (bet: Bet) => {
    if (bet.raise) {
        return 'raise'
    }
    if (bet.fold) {
        return 'fold'
    }
    if (bet.check) {
        return 'check'
    }
    if (bet.call) {
        return 'call'
    }
}

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

export const CardView = (props: { class?: string, card: Card }) => {

    let [rank, suit] = props.card.split('')
    rank = rank.replace('T', '10')
    let klass = createMemo(() => props.class ? 'card ' + props.class : 'card')


    return (<>
    <div class={klass()}>
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

export const CardHolder = (props: { class?: string, card?: Card }) => {

    return (<>
      <div class='card-wrap'>
        <div class='card-holder'></div>
        <Show when={props.card}>{card => 
          <CardView {...props} card={card()}></CardView>
        }</Show>
      </div>
    </>)
}


export const Hand = (props: HandCards) => {
    return (<>
    <div class='hand updatable updated'>
        <CardHolder card={props.hand?.[0]} />
        <CardHolder card={props.hand?.[1]} />
    </div>
    </>)
}

type Uk<T> = { klass: string, value: T | undefined }

type HandCards = { hand: Uk<[Card, Card]> }
type MiddleCards = { flop: Uk<[Card, Card, Card]>, turn: Uk<Card>, river: Uk<Card> }

export const Middle = (props: MiddleCards) => {
    return (<>
    
    <div class='middle'>
        <div class='showdown-info'>
            <span>Ace High, 3 5</span>
        </div>
        <div class='ftr'>
            <div class={'flop ' + props.flop.klass}>
              <CardHolder class='flop-0' card={props.flop.value?.[0]}/>
              <CardHolder class='flop-1' card={props.flop.value?.[1]}/>
              <CardHolder class='flop-2' card={props.flop.value?.[2]}/>
            </div>
            <div class={'turn ' + props.turn.klass}>
                <CardHolder card={props.turn.value} />
            </div>
            <div class={'river ' + props.river.klass}>
                <CardHolder card={props.river.value} />
            </div>
        </div>
    </div>
    </>)
}

export const Chips = (props: { class?: string, chips: number }) => {
    return (<> <span class={'pot chips ' + (props.class ?? '')}>{props.chips}<span>li</span></span> </>)
}
export const InlineChips = (props: { chips: number }) => {
    return (<> <span class='inline chips'>{props.chips}<span>li</span></span> </>)
}

type Bet = {
    call?: true,
    check?: true,
    fold?: true,
    raise?: number
    chips?: number
}

type PersonProps = HandCards & {
    class?: string,
    bet?: Bet,
    chips: number,
    state: string,
    turn_left?: number
}

export const Person = (props: PersonProps) => {


    let klass = ''
    if (props.state === '@') { klass += ' turn' }
    if (props.state === 'i') { klass += ' in' }
    if (props.state === 'f') { klass += ' folded' }
    if (props.class) { klass += ' ' + props.class }

    return (<>
        <div class={'person ' + klass }>
            <div class='handle'>
                <span>Handle</span>
                <Hand {...props} />
            </div>
            <div class='stack-wrap'>
                <Show when={props.turn_left}>{ turn_left =>
                    <>
                    <div class='turn-left'><div class='bar' style={`width: ${turn_left()}%;`}></div></div>
                    </>
                }</Show>
                <div class='bets'>
                    <Show when={props.bet}>{bet =>
                        <>
                            <div class={'bet updatable updated ' + bet_klass(bet())}>
                                <Show when={bet().raise}>{raise =>
                                    <span class='raise'>Raise <InlineChips chips={raise()} /></span>
                                }</Show>
                                <Show when={bet().fold}>
                                    <span>Fold</span>
                                </Show>
                                <Show when={bet().check}>
                                    <span>Check</span>
                                </Show>
                                <Show when={bet().call}>
                                    <span>Call</span>
                                </Show>
                            </div>
                            <Show when={bet().chips}>{chips =>
                                <Chips chips={chips()} />
                            }</Show>
                        </>
                    }</Show>
                </div>
                <div class='stack updatable updated'> <h3>Stack</h3> <Chips chips={props.chips} /></div>
            </div>
        </div>
    </>)
}

export const EventInfo = () => {
    return (<>
    <div class='event'>
        <span class='name'>Texas No-Limit Hold'em Headsup Tournament</span>
        <span class='desc'>A Texas No-Limit Hold'em Headsup Tournament organized by liheadsup</span>
        <span class='players'><span>Players Left:</span> <span>3</span></span>
        <span class='blinds'><span>Blinds:</span> <span><InlineChips chips={10}/>/<InlineChips chips={20}/></span></span>
        <span class='next-level'><span>Next Level:</span> 02:00 </span>
        <span class='prize'><span>Prize:</span><InlineChips chips={3000}/></span>
    </div>
    </>)
}

export const MiddleNHands = (props: { people: PersonProps[], middle: MiddleCards, pot: Uk<number> }) => {
    return (<>
        <div class='logo'>
            <span>li</span><span>headsup</span>
        </div>
        <div class='dealer'>
            <EventInfo/>
            <CardHolder class=''/>
            <Middle {...props.middle} />
            <div class={'pots pops ' + props.pot.klass}>
                <h3>Main Pots</h3>
                <Show when={props.pot.value}>{ pot =>
                   <Chips class='pop' chips={pot()}/>
                }</Show>
            </div>
        </div>
        <div class='people'>
            <Index each={props.people}>{(person, i) => 
                <Person class={side_klass[i]} {...person()}/>
            }</Index>
        </div>
    </>)
}

export const Showcase = () => {

    const [_flop, _set_flop] = createSignal<[Card, Card, Card] | undefined>(undefined)
    const [_turn, _set_turn] = createSignal<Card | undefined>(undefined)
    const [_river, _set_river] = createSignal<Card | undefined>(undefined)
    const [_pot, _set_pot] = createSignal<number | undefined>(undefined)

    const flop: Accessor<[Card, Card, Card] | undefined> = () => _flop()
    const turn = () => _turn()
    const river = () => _river()
    const pot = () => _pot()

    let u_flop = uklass(flop, { init_delay: 300, update_delay: 2000, exit_delay: 300})
    let u_turn = uklass(turn, { init_delay: 2000, update_delay: 3000, exit_delay: 300})
    let u_river = uklass(river, { init_delay: 4000, update_delay: 3000, exit_delay: 300})

    let u_pot = uklass(pot, { update_delay: 300, exit_delay: 1000 })

    const middle = createMemo(() => ({ flop: u_flop, turn: u_turn, river: u_river }))

    setTimeout(() => {
        _set_flop(['Ah', 'Ad', 'Ac'])
        _set_turn('Td')
        _set_river('Ts')
        _set_pot(100)
    }, 1000)
    setTimeout(() => {

        _set_pot(2000)
    }, 5000)
    setTimeout(() => {
        _set_flop(undefined)
        _set_turn(undefined)
        _set_river(undefined)
        _set_pot(undefined)
    }, 10000)

    return (<>
    <div class='showcase'>
        <ShowcaseSection header='Card'>
            <>
            <div class='hands'>
                <MiddleNHands pot={u_pot} people={[{turn_left: 20, chips: 1000, state: '@', bet: { chips: 100, raise: 20 }}, { state: '@', chips: 100 }]} middle={{...middle()}}/>
            <div class='buttons'>
                <button>Deal Cards</button>
                <button>Deal Flop</button>
                <button>Deal Rest</button>
                <button>Collect Cards</button>
            </div>
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


type UOptions = {
    init_delay?: number,
    update_delay?: number,
    exit_delay?: number
}

const uklass = function<T>(target: Accessor<T | undefined>, opts: UOptions): Uk<T> {

    let i_delay = opts.init_delay ?? 0
    let u_delay = i_delay + (opts.update_delay ?? 0)
    let e_delay = u_delay + (opts.exit_delay ?? 0)

    const [klass, set_klass] = createSignal<string>('updatable')
    const [current, set_current] = createSignal<T | undefined>(undefined)

    createEffect(on(target, (t, p) => {
        let clear_id2: number
        let clear_id: number
        if (p && !t) {
            set_klass('updatable exiting')
            clear_id = setTimeout(() => {
                batch(() => {
                  set_current(undefined)
                  set_klass('updatable')
                })
            }, e_delay)
        } else if (p !== t) {
            batch(() => {
              set_current(() => t)
              set_klass('updatable init')
            })

            clear_id = setTimeout(() => {
                set_klass('updatable updating')
            }, 300 + i_delay)

            clear_id2 = setTimeout(() => {
                set_klass('updatable updated')
            }, u_delay)
        }

        onCleanup(() => { 
            set_current(() => t)
            set_klass('updatable')
            clearTimeout(clear_id) 
            clearTimeout(clear_id2) 
        })

    }))

    return {get klass() { return klass() }, get value() { return current() } }
}