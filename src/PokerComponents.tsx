import { Card, Card3, Card5, Side, Suit, split_cards } from 'phevaluatorjs25'
import './Components.scss'
import { batch, createEffect, createMemo, createSignal, Index, JSX, Match, on, onCleanup, Show, Switch } from "solid-js"

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

export const CardHolder = (props: { class?: string, elevate: Uk<boolean>, card: Uk<Card> }) => {

    return (<>
      <div class={'card-wrap ' + (props.class ?? '')}>
        <div class='card-holder'></div>
        <Show when={props.card.value}>{card => 
          <div class={'elevate ' + props.elevate.klass}>
            <CardView class={props.card.klass} card={card()}></CardView>
          </div>
        }</Show>
      </div>
    </>)
}


export const Hand = (props: HandCards) => {
    return (<>
    <div class={'hand'}>
        <CardHolder {...props.hand[0]} />
        <CardHolder {...props.hand[1]} />
    </div>
    </>)
}

type Uk<T> = { resolve_on_updated: Promise<void>, updated: boolean, klass: string, value: T | undefined, set_target: (_: T | undefined) => Promise<void>}


type CardProp = { card: Uk<Card>, elevate: Uk<boolean>, back: Uk<boolean> } 
& { 
    set_card: (_: Card | undefined) => Promise<void> 
    set_elevate: (_: Card5) => Promise<void>
    set_back: (_: boolean | undefined) => Promise<void>
}
type HandCards = { hand: [CardProp, CardProp] }
type MiddleCards = { flop: [CardProp, CardProp, CardProp], turn: CardProp, river: CardProp } & ShowdownInfo

type ShowdownInfo = { showdown_info: Uk<string> }

export const Middle = (props: MiddleCards) => {
    return (<>
    
    <div class='middle'>
        <div class={'showdown-info ' + props.showdown_info.klass}>
            <span>{props.showdown_info.value}</span>
        </div>
        <div class='ftr'>
            <CardHolder class={'flop ' + props.flop[0].card.klass} {...props.flop[0]}/>
            <CardHolder class={'flop ' + props.flop[1].card.klass} {...props.flop[1]}/>
            <CardHolder class={'flop ' + props.flop[2].card.klass} {...props.flop[2]}/>
            <CardHolder class={'turn ' + props.turn.card.klass} {...props.turn} />
            <CardHolder class={'river ' + props.river.card.klass} {...props.river} />
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
    class: string,
    bet: Uk<Bet>,
    chips: Uk<number>,
    state: Uk<string>,
    turn_left: Uk<number>
} & {
    set_chips: (_: number | undefined) => Promise<void>
}

export const Person = (props: PersonProps) => {

    const klass = createMemo(() => {
        let state = props.state.value
        let klass = ''
        if (state === '@') { klass += ' turn' }
        if (state === 'i') { klass += ' in' }
        if (state === 'f') { klass += ' folded' }
        klass += ' ' + props.class
        return klass
    })

    return (<>
        <div class={'person ' + klass() }>
            <div class='handle'>
                <span>Handle</span>
                <Hand {...props} />
            </div>
            <div class='stack-wrap'>
                <Show when={props.turn_left.value}>{ turn_left =>
                    <>
                    <div class='turn-left'><div class='bar' style={`width: ${turn_left()}%;`}></div></div>
                    </>
                }</Show>
                <div class='bets'>
                    <Show when={props.bet.value}>{bet =>
                        <>
                            <div class={['bet', props.bet.klass, bet_klass(bet())].join(' ')}>
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
                <div class={'stack ' + props.chips.klass}> <h3>Stack</h3> <Chips chips={props.chips.value ?? 0} /></div>
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
            <div class='card-wrap'>
                <div class='card-holder'></div>
            </div>

            <Middle {...props.middle} />
            <div class={'pots pops ' + props.pot.klass}>
                <h3>Main Pots</h3>
                <Show when={props.pot.value}>{ pot =>
                   <Chips class='pop' chips={pot()}/>
                }</Show>
            </div>
        </div>
        <div class='people'>
            <Index each={props.people}>{(person) => 
                <Person  {...person()}  />
            }</Index>
        </div>
    </>)
}

export const PersonProper = (i: Side) => {

    const [_class, _set_class] = createSignal<string>(side_klass[i - 1])

    let hand = UCardProper2({ init_delay: 300, update_delay: 2000, exit_delay: 300})
    let chips = uklass<number>({ init_delay: 100, update_delay: 200, exit_delay: 300})
    let state = uklass<string>({ init_delay: 300, update_delay: 2000, exit_delay: 300})
    let bet = uklass<Bet>({ init_delay: 300, update_delay: 2000, exit_delay: 300})
    let turn_left = uklass<number>({ init_delay: 300, update_delay: 2000, exit_delay: 300})

    return { 
        set_chips(_: number | undefined) { 
            return chips.set_target(_) 
        } , 
        turn_left, hand: hand.cards, chips, state, bet, get class() { return _class() } }
}

export const UCardProper = (opts: UOptions): CardProp => {
    const card = uklass<Card>(opts)
    const elevate = uklass<boolean>({ update_delay: 8000 })
    const back = uklass<boolean>(opts)

    return { 
        card,
        elevate,
        back,
        set_card(_: Card | undefined) {
            return card.set_target(_)
        },
        set_elevate(_: Card5) {
            return elevate.set_target(_.includes(card.value ?? ''))
        },
        set_back(_: boolean | undefined) {
            return back.set_target(_)
        }
    }
}

export const UCardProper2 = (opts: UOptions) => {
    return {
    cards: [UCardProper(opts), UCardProper(opts)] as [CardProp, CardProp],
    set_cards(cards: [Card, Card] | undefined) {
        this.cards[0].set_card(cards?.[0])
        return this.cards[1].set_card(cards?.[1])
    }
   }
}

export const UCardProper3 = (opts: UOptions) => {
   return {
    cards: [UCardProper(opts), UCardProper(opts), UCardProper(opts)] as [CardProp, CardProp, CardProp],
    set_cards(cards: [Card, Card, Card] | undefined) {
        this.cards[0].set_card(cards?.[0])
        this.cards[1].set_card(cards?.[1])
        return this.cards[2].set_card(cards?.[2])
    }
   }
}


export const MiddleNProper = () => {
    const [_people, _set_people] = createSignal<PersonProps[]>([PersonProper(1), PersonProper(2)])

    let u_flop = UCardProper3({ init_delay: 300, update_delay: 2000, exit_delay: 300})
    let u_turn = UCardProper({ init_delay: 300, update_delay: 3000, exit_delay: 300})
    let u_river = UCardProper({ init_delay: 300, update_delay: 3500, exit_delay: 300})

    let u_pot = uklass<number>({ update_delay: 300, exit_delay: 1000 })
    let u_showdown_info = uklass<string>({ update_delay: 6000, exit_delay: 1000 })


    const middle = createMemo(() => ({ flop: u_flop.cards, turn: u_turn, river: u_river, showdown_info: u_showdown_info }))
    const people = createMemo(() => _people())


    return {
        pot: u_pot,
        get middle() {
            return middle()
        },
        get people() {
            return people()
        },
        set_flop(cards: [Card, Card, Card] | undefined) {
            return u_flop.set_cards(cards)
        },
        set_turn(card: Card | undefined) {
            return u_turn.set_card(card)
        },
        set_river(card: Card | undefined) {
            return u_river.set_card(card)
        },
        set total_pot(pot: number | undefined) {
            u_pot.set_target(pot)
        },
        reveal_middle(middle: Card5) {
            let flop = middle.slice(0, 3) as Card3
            let turn = middle[3]
            let river = middle[4]

            let resolve = Promise.resolve()
            resolve = resolve.then(() => u_flop.set_cards(flop))
            resolve = resolve.then(() => u_turn.set_card(turn))
            resolve = resolve.then(() => u_river.set_card(river))
            return resolve
        },
        set_showdown_info(info: SetShowdownInfo[] | undefined) {
            let resolve = Promise.resolve()

            info?.forEach(info => {
                if (!info) {
                    resolve = resolve.then(() => u_showdown_info.set_target(undefined))
                    return
                }

                resolve = resolve.then(() => u_showdown_info.set_target(info.desc))
                let cards = info.cards
                resolve = resolve.then(() => {
                    let hand = people()[info.side - 1].hand
                    let h1 = hand[0].set_elevate(cards)
                    let h2 = hand[1].set_elevate(cards)

                    console.log('set elevate', cards)
                    return Promise.all([
                        u_flop.cards[0].set_elevate(cards),
                    u_flop.cards[1].set_elevate(cards),
                    u_flop.cards[2].set_elevate(cards),
                    u_turn.set_elevate(cards),
                    u_river.set_elevate(cards),
                    h1, h2]).then(() => {})
                })
            })
            return resolve
        }
    }
}

type SetShowdownInfo = {
    desc: string,
    cards: Card5,
    side: Side,
    chips: number
}


export const Showcase = () => {

    const u_m = MiddleNProper()


    setTimeout(() => {
        let resolve = Promise.resolve()
        resolve = resolve.then(() => u_m.set_flop(['Ah', 'Ac', 'Ad']))
        resolve = resolve.then(() => u_m.set_turn('Td'))
        resolve = resolve.then(() => u_m.set_river('Ts'))
        u_m.total_pot = 100
        u_m.people[0].set_chips(1000)
        resolve = resolve.then(() => u_m.set_showdown_info([{
            desc: 'High Card A J 3',
            cards: split_cards('AhAcAdTdTs') as Card5,
            side: 1,
            chips: 100
        }, {
            desc: 'Two Pair A K Q',
            cards: split_cards('AhAcKcKdTs') as Card5,
            side: 2,
            chips: 100
        }]))
        resolve.then(() => {
            console.log('done')
        })
    }, 1000)
    setTimeout(() => {

        return
        /*
        u_m.river = undefined
        u_m.flop = undefined
        u_m.total_pot = 2000
        u_m.people[0].set_chips(100)
        */
    }, 5000)
    setTimeout(() => {
        return
        /*
        u_m.showdown_info = {
            desc: 'High Card A J 3',
            cards: split_cards('AhAcAdTdTs') as Card5,
            side: 1
        }
        u_m.total_pot = undefined
        */
    }, 10000)

    return (<>
    <div class='showcase'>
        <ShowcaseSection header='Card'>
            <>
            <div class='hands'>
                <MiddleNHands {...u_m}/>
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

const uklass = function<T>(opts: UOptions, def_value?: T): Uk<T> {

    let [target, set_target] = createSignal<T | undefined>(def_value, { equals: false })
    let i_delay = (opts.init_delay ?? 0) + 300
    let u_delay = i_delay + (opts.update_delay ?? 0)
    let e_delay = (opts.exit_delay ?? 0)

    const [updated, set_updated] = createSignal(false)
    const [klass, set_klass] = createSignal<string>('updatable')
    const [current, set_current] = createSignal<T | undefined>(undefined)
    let resolves: (()=> void)[] = []

    createEffect(on(target, (t, p) => {
        let clear_id2: number
        let clear_id: number
        console.log(p, t, u_delay, resolves)
        if (p && t === undefined) {

            set_klass('updatable exiting')
            clear_id = setTimeout(() => {
                batch(() => {
                  set_current(undefined)
                  set_klass('updatable')

                  resolves.forEach(_ => _())
                  resolves = []
                })
            }, e_delay)
        } else if (p !== t) {
            set_updated(false)
            set_klass('updatable init')

            clear_id = setTimeout(() => {
                batch(() => {
                  set_klass('updatable updating')
                  set_current(() => t)
                })
            }, i_delay)

            clear_id2 = setTimeout(() => {
                set_klass('updatable updated')
                set_updated(true)
                console.log('clear ', p, t, resolves)
                resolves.forEach(_ => _())
                resolves = []
            }, u_delay)
        } else {
            resolves.forEach(_ => _())
            resolves = []
        }

        onCleanup(() => { 
            batch(() => {
                console.log('clear cleanup', p, t, resolves)
                set_updated(false)
                set_current(() => t)
            })
            clearTimeout(clear_id) 
            clearTimeout(clear_id2) 

        })

    }))

    return { 
        get resolve_on_updated() {
            return new Promise<void>(resolve => { resolves.push(resolve) })
        }, 
        get updated() { return updated() }, 
        get klass() { return klass() }, 
        get value() { return current() },
        set_target(t: T | undefined) { 
            let res = this.resolve_on_updated
            set_target(() => t) 
            return res
        }
    }
}