import './Avatar.scss'
import { ActionBetEvent, Bet, ButtonEvent, Card, ChangeState, Chips, CollectHand, CollectPot, Dests, Event, Events, FlopEvent, GameN, get_klass_info, HandEvent, Headsup, make_deal, PotAddBet, PotShare, PotShareEvent, Raise, ranks, RiverEvent, RoundN, RoundNPov, Seat, Side, Stack, StackAddEvent, StackEvent, StackState, suits, TurnEvent } from 'phevaluatorjs25'
import { Accessor, createEffect, createMemo, createResource, createSignal, For, Index, on, ResourceReturn, Show, Signal } from 'solid-js'


const card_klass = (card: Card) => {

  const suit_klasses = ['clubs', 'diamonds', 'hearts', 'spades']
  const rank_klasses = ['two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'jack', 'queen', 'king', 'ace']

  let rank = rank_klasses[ranks.indexOf(card[0])]
  let suit = suit_klasses[suits.indexOf(card[1])]

  return `card ${suit} ${rank}`
}



class RaiseUI {

  get on_send_action() {
    return 'raise ' + this.to_match + '-' + this.to_raise
  }

  get to_match () {
    return this.raise.cant_match ?? this.raise.match
  }

  get to_raise() {
    return this.current
  }

  get threebet() {
    if (this.raise.cant_minraise) {
      return undefined
    }
    let bet = this.raise.min_raise * 3
    if (this.raise.match === 0) {
      if (bet <= this.raw_raise_for_raise_to_allin) {
        return bet
      }
    }
  }


  get fivebet() {
    if (this.raise.cant_minraise) {
      return undefined
    }
    let bet = this.raise.min_raise * 5
    if (this.raise.match === 0) {
      if (bet <= this.raw_raise_for_raise_to_allin) {
        return bet
      }
    }
  }

  get potraise() {
    if (this.raise.cant_minraise) {
      return undefined
    }
    let bet = this.pot
    if (bet <= this.raw_raise_for_raise_to_allin) {
      if (this.raise.min_raise >= bet) {
        return bet
      }
    }
  }

  get min_raise() {
    if (this.raise.cant_minraise) {
      return undefined
    }
    let bet = this.raise.min_raise
    if (bet === 0) {
      return undefined
    }
    if (this.raise.match !== 0) {
      if (bet <= this.raw_raise_for_raise_to_allin) {
        return bet
      }
    }
  }

  get third_raise() {
    if (this.raise.cant_minraise) {
      return undefined
    }
    let bet = this.raise.min_raise * 3
    if (bet === 0) {
      return undefined
    }
    if (this.raise.match !== 0) {

      if (bet <= this.raw_raise_for_raise_to_allin) {
        return bet
      }
    }
  }


  get five_raise() {
    if (this.raise.cant_minraise) {
      return undefined
    }
    let bet = this.raise.min_raise * 5
    if (bet === 0) {
      return undefined
    }
    if (this.raise.match !== 0) {
      if (bet <= this.raw_raise_for_raise_to_allin) {
        return bet
      }
    }
  }

  get raise_to() {
    return (this.stack.bet[0]()?.total ?? 0) + this.raise.match + this.current
  }

  get raw_raise_for_raise_to_allin() {
    return this.stack.stack[0]() - this.raise.match
  }

  get allin() {
    return this.raise.cant_minraise ? this.raise.match : this.raw_raise_for_raise_to_allin
  }

  get current() {
    return this._current[0]()
  }

  set current(e: number) {
    this._current[1](e)
  }

  get current_enabled() {
    return !(this.raise.cant_minraise || this.raise.cant_match)
  }

  on_current(v: number) {
    this.current = v
  }

  _current: Signal<Chips>

  constructor(readonly raise: Raise, readonly stack: StackMemo, readonly pot: Chips) {
    this._current = createSignal(raise.min_raise === 0 ? raise.match : raise.min_raise)
  }


}

type KlassInfo = {
  klass: number,
  abbr: string,
  desc: string,
  short_desc: string,
  kickers: number[]
}


class StackMemo {

    init_hydrate(value: Stack): any {
      this.bet[1](value.bet)
      this.stack[1](value.stack)
      this.state[1](value.state)
      this.hand.map((h, i) => h.card = value.hand?.[i])
    }

    bet: Signal<Bet | undefined> = createSignal<Bet | undefined>(undefined)
    stack: Signal<number> = createSignal(0)
    state: Signal<StackState> = createSignal('')
    hand: [CardRevealMemo, CardRevealMemo] = [new CardRevealMemo(), new CardRevealMemo()]

    get hand2() {
      return this.hand.map(_ => _.card!) as [Card, Card]
    }
}

class PotMemo {

  _total_pot: Signal<Chips> = createSignal(0)

  get total_pot() {
    return this._total_pot[0]()
  }

  set total_pot(_: Chips) {
    this._total_pot[1](_)
  }
}


class ShowdownWinInfo {

  info: KlassInfo

  get desc() {
    return this.info.desc
  }

  constructor(
    readonly middle: [Card, Card, Card, Card, Card], 
    readonly hand: [Card, Card],
    readonly side: Side,
    readonly chips: Chips) {

      this.info = get_klass_info([...middle, ...hand])
  }
}

class PotShareInfo {

  get showdown_win_info() {
    if (this.share.swin) {
      let [side, chips] = this.share.swin

      return new ShowdownWinInfo(this.middle, this.hands[side - 1], side, chips)
    }
  }

  get win() {
    if (this.share.win) {
      return this.share.win
    }
  }

  get back() {
    if (this.share.back) {
      return this.share.back
    }
  }

  constructor(readonly share: PotShare, readonly hands: [Card, Card][], readonly middle: [Card, Card, Card, Card, Card]) {

  }

}

class CardRevealMemo {

  get klass() {

    if (!this.card) {
      return undefined
    }

    let kk = card_klass(this.card)
    
    if (this.is_reveal()) {
      kk += ' show reveal'
    } else if (this.is_show()) {
      kk = 'card back show'
    } else {
      kk = 'card back'
    }
    return kk
  }

  get card() {
    return this._card[0]()
  }

  set card(_: Card | undefined) {
    this._card[1](_)

    clearInterval(this.clear_timer)
    this.clear_timer = undefined

    if (_ === undefined) {
      if (this._resolve_after_clear) {
          this._resolve_after_clear.forEach(_ => _())
          this._resolve_after_clear = []
      }
      return
    }

    this._t_elapsed[1](0)
    this.clear_timer = setInterval(() => {
      let e = this._t_elapsed[0]()

      this._t_elapsed[1](e + 60)

      if (e > this.show_delay_ms + this.reveal_delay_ms) {
        if (this._resolve_after_clear) {
          this._resolve_after_clear.forEach(_ => _())
          this._resolve_after_clear = []
        }
        clearInterval(this.clear_timer)
        this.clear_timer = undefined
      }
    }, 60)
  }

  get resolve_animation_end() {
    return new Promise<void>(resolve => {
      if (this.clear_timer) {
        this._resolve_after_clear.push(resolve)
      } else {
        resolve()
      }
    })
  }

  _resolve_after_clear: (() => void)[] = []

  _card: Signal<Card | undefined>

  _t_elapsed: Signal<number>

  is_reveal: Accessor<boolean>
  is_show: Accessor<boolean>

  _reveal_delay_ms = createSignal(300)
  _show_delay_ms = createSignal(0)

  get reveal_delay_ms() {
    return this._reveal_delay_ms[0]()
  }

  set reveal_delay_ms(_: number) {
    this._reveal_delay_ms[1](_)
  }

  get show_delay_ms() {
    return this._show_delay_ms[0]()
  }

  set show_delay_ms(_: number) {
    this._show_delay_ms[1](_)
  }



  private clear_timer?: number

  constructor() {

    this._card = createSignal<Card | undefined>(undefined)

    this._t_elapsed = createSignal(0)

    this.is_reveal = createMemo(() => this._t_elapsed[0]() >= this.show_delay_ms + this.reveal_delay_ms)
    this.is_show = createMemo(() => this._t_elapsed[0]() >= this.show_delay_ms)
  }
}

class RoundNPovMemo {
  patch(ev: Event[]) {

    let pot_shares: PotShare[] = []
    let reveal_delay = 0

    ev.forEach(ev => {
      if (ev instanceof ChangeState) {
        this.stacks[ev.side - 1].state[1](ev.state)
      }
      if (ev instanceof HandEvent) {
        let hh = this.stacks[ev.side - 1].hand

        hh[0].card = ev.hand[0]
        hh[1].card = ev.hand[1]

      }
      if (ev instanceof StackEvent) {
        let stack = this.stacks[ev.side - 1].stack[0]()
        this.stacks[ev.side - 1].stack[1](stack - ev.delta)
      }

      if (ev instanceof ActionBetEvent) {
        this.stacks[ev.side - 1].bet[1](ev.bet)
      }

      if (ev instanceof FlopEvent) {
        reveal_delay += 2000
        if (!this.no_delay) this.flop.map(_ => _.show_delay_ms = reveal_delay)
        this.flop.map((_, i) => _.card = ev.flop[i])
      }

      if (ev instanceof TurnEvent) {
        reveal_delay += 3000

        if (!this.no_delay) this.turn.show_delay_ms = reveal_delay
        this.turn.card = ev.turn
      }

      if (ev instanceof RiverEvent) {
        reveal_delay += 4000
        if (!this.no_delay) this.river.show_delay_ms = reveal_delay
        this.river.card = ev.river
      }

      if (ev instanceof PotShareEvent) {
        if (ev.share.swin) {
          let [side, chips] = ev.share.swin

          let stack = this.stacks[side - 1].stack[0]()
          this.stacks[side - 1].stack[1](stack + chips)


          pot_shares.push(ev.share)


        }
        if (ev.share.win) {
          let [side, chips] = ev.share.win

          let stack = this.stacks[side - 1].stack[0]()
          this.stacks[side - 1].stack[1](stack + chips)
        }
      }

      if (ev instanceof CollectHand) {
        this.stacks.forEach(_ => _.hand.map(_ => _.card = undefined))
      }
      if (ev instanceof CollectPot) {
        this.pot.total_pot = 0
      }


      if (ev instanceof StackAddEvent) {

        let stack = this.stacks[ev.side - 1].stack[0]()

        this.stacks[ev.side - 1].stack[1](stack + ev.delta)
      }

      if (ev instanceof ButtonEvent) {
        this.button[1](ev.side)
      }

      if (ev instanceof PotAddBet) {
        this.pot.total_pot += ev.chips
      }

    })


    if (pot_shares.length > 0) {
      this.pot_shares[1](pot_shares.map(_ => new PotShareInfo(_, this.stacks.map(_ => _.hand2), this.middle5)))
    }
  }

  get middle() {
    let flop = this.flop.map(_ => _.card)
    let turn = this.turn.card
    let river = this.river.card

    return [...flop, turn, river].filter(Boolean)
  }

  get middle5() {
    return this.middle as [Card, Card, Card, Card, Card]
  }

  small_blind: Signal<Chips> = createSignal(0)
  button: Signal<Side> = createSignal<Side>(1)
  stacks: StackMemo[]
  pot: PotMemo = new PotMemo()
  flop: [CardRevealMemo, CardRevealMemo, CardRevealMemo] = [new CardRevealMemo(), new CardRevealMemo(), new CardRevealMemo()]
  turn: CardRevealMemo = new CardRevealMemo()
  river: CardRevealMemo = new CardRevealMemo()

  pot_shares: Signal<PotShareInfo[] | undefined> = createSignal<PotShareInfo[] | undefined>(undefined)

  no_delay: boolean = false

  init_hydrate(round_pov: RoundNPov | undefined) {
    if (!round_pov) {

      this._is_initialized[1](false)
    } else {
        this._is_initialized[1](true)

        this.small_blind[1](round_pov.small_blind)
        this.button[1](round_pov.button)
        this.stacks.map((stack, i) => stack.init_hydrate(round_pov.stacks[i]))
        this.pot.total_pot = round_pov.pot?.total_pot ?? 0
        this.flop.map((c, i) => c.card = round_pov.flop?.[i])
        this.turn.card = round_pov.turn
        this.river.card = round_pov.river
        this.pot_shares[1](round_pov.shares?.map(_ => new PotShareInfo(_, round_pov.stacks.map(_ => _.hand!), round_pov.middle as [Card, Card, Card, Card, Card])))
    }
  }

  get is_initialized() {
    return this._is_initialized[0]()
  }


  _is_initialized: Signal<boolean> = createSignal(false)

  constructor(readonly nb: number) {
    this.stacks = [...Array(nb).keys()].map(_ => new StackMemo())
  }
}

class SeatMemo {

  init_hydrate(value: Seat): any {
    this.chips = value.chips
    this.state = value.state
  }

  _chips: Signal<number> = createSignal(0)
  _state: Signal<StackState> = createSignal('')

  get chips() {
    return this._chips[0]()
  }

  set chips(_: number) {
    this._chips[1](_)
  }

  get state() {
    return this._state[0]()
  }

  set state(_: StackState) {
    this._state[1](_)
  }

}

class GameNMemo {

  seats: SeatMemo[]

  init_hydrate(game_pov: GameN | undefined) {
    if (!game_pov) {
      this._is_initialized[1](false)
    } else {
      this._is_initialized[1](true)
      this.seats.map((_, i) => _.init_hydrate(game_pov.seats[i]))
    }
  }

  get is_initialized() {
    return this._is_initialized[0]()
  }


  _is_initialized: Signal<boolean> = createSignal(false)


  constructor(readonly nb: number) {
    this.seats = [...Array(nb).keys()].map(_ => new SeatMemo())
  }
}

class HeadsupMemo {

  game_init(game_pov?: GameN) {
    this.gamen.init_hydrate(game_pov)
  }
  round_init(round_pov?: RoundNPov) {
    this.roundn.init_hydrate(round_pov)
  }

  get is_round_initialized() {
    return this.roundn.is_initialized
  }

  

  gamen: GameNMemo
  roundn: RoundNPovMemo
  _dests: Signal<Dests | undefined> = createSignal<Dests | undefined>(undefined)

  dests_resource: ResourceReturn<Dests | undefined>

  dests: Accessor<Dests | undefined>

  flop: Accessor<[CardRevealMemo, CardRevealMemo, CardRevealMemo] | undefined>
  turn: Accessor<CardRevealMemo | undefined>
  river: Accessor<CardRevealMemo | undefined>

  stacks: Accessor<StackMemo[] | undefined>
  seats: Accessor<SeatMemo[] | undefined>
  pot: Accessor<PotMemo | undefined>
  pot_shares: Accessor<PotShareInfo[] | undefined>

  get resolve_animation_end() {
    return Promise.all([
      this.flop()?.[0].resolve_animation_end,
      this.turn()?.resolve_animation_end,
      this.river()?.resolve_animation_end,
    ])
  }

  constructor() {
    this.gamen = new GameNMemo(2)
    this.roundn = new RoundNPovMemo(2)
    this.dests_resource = createResource(this._dests[0], async dests => {
      await this.resolve_animation_end
      return dests
    })

    this.dests = createMemo(() => {
      if (this.dests_resource[0].loading) {
        return undefined
      }
      return this.dests_resource[0]()
    })

    this.flop = createMemo(() => this.roundn.is_initialized ? this.roundn.flop : undefined)
    this.turn = createMemo(() => this.roundn.is_initialized ? this.roundn.turn : undefined)
    this.river = createMemo(() => this.roundn.is_initialized ? this.roundn.river : undefined)

    this.pot = createMemo(() => this.roundn.is_initialized ? this.roundn.pot : undefined)
    this.pot_shares = createMemo(() => this.roundn.is_initialized ? this.roundn.pot_shares[0]() : undefined)

    this.stacks = createMemo(() => this.roundn.is_initialized ? this.roundn.stacks : undefined)
    this.seats = createMemo(() => this.gamen.is_initialized ? this.gamen.seats : undefined)
  }

  round_patch(events: Event[]) {
    this.roundn.patch(events)
  }
}


class Player {

  opponent_act(_npov: RoundNPov, _action: string) {
  }
  act(_npov: RoundNPov, _round_dests: Dests) {
    return new Promise<string>(resolve => {
      this.resolve = resolve
    })
  }

  resolve?: (_: string) => void

  send_action(cmd: string) {
    this.resolve?.(cmd)
  }

  round_events(events: Event[]) {
    this._round_events(events)
  }

  game_events(events: Event[]) {
    this._game_events(events)
  }



  _round_events(_events: Event[]) {}
  _game_events(_events: Event[]) {}
}

class AIPlayer extends Player {

  async act(_npov: RoundNPov, dests: Dests) {
    if (dests.raise) {
      let { match, min_raise, cant_match, cant_minraise } = dests.raise

      if (cant_match !== undefined) {
        return `raise ${cant_match}-0`
      } else if (cant_minraise !== undefined) {
        return `raise ${match}-${cant_minraise}`
      } else {
        return `raise ${match}-${min_raise}`
      }
    }
    if (dests.call) {
      return `call ${dests.call.match}`
    }

    throw `Cant go "allin" ${dests.fen}`
  }
}

class UIPlayer extends Player {

  hm: HeadsupMemo

  constructor() {
    super()
    this.hm = new HeadsupMemo()
  }

  _round_events(events: Event[]): void {
    this.hm.round_patch(events)
  }
}

type RecordEvent = { game_events?: Event[], round_events?: Event[], round_pov?: RoundNPov, game_pov?: GameN }



class HeadsupReplay {

  round_events(round_events: Events, round: RoundN | undefined, game: GameN | undefined) {
    this.events.push({ round_events: round_events.pov(1), round_pov: round?.pov(1), game_pov: game?.pov(1) })
    this._events[1](this.events)
  }

  game_events(game_events: Events, round: RoundN | undefined, game: GameN | undefined) {
    this.events.push({ game_events: game_events.pov(1), round_pov: round?.pov(1), game_pov: game?.pov(1) })
    this._events[1](this.events)
  }


  _events: Signal<RecordEvent[]> = createSignal<RecordEvent[]>([], { equals: false })
  _i: Signal<number> = createSignal(-1)

  get events() {
    return this._events[0]()
  }

  hm: HeadsupMemo = new HeadsupMemo()


  get i() {
    return this._i[0]()
  }

  set i(_: number) {
    this._i[1](_)
  }

  playing = false

  go_to_i(i: number) {
    this.hm.roundn.no_delay = true
    this.playing = false
    this.i = i
  }

  go_forward() {
    this.playing = false
    this.hm.roundn.no_delay = true
    if (this.i === -1) {
    } else if (this.i === this.events.length - 1) {
      this.i = -1
    } else {
      this.i++
    }

  }

  go_back() {
    this.hm.roundn.no_delay = true
    this.playing = false
    if (this.i === -1) {
      this.i = this.events.length - 2
    } else if (this.i > 0) {
      this.i--
    }
  }

  async play_loop() {
    this.hm.roundn.no_delay = false
    this.playing = false
    if (this.i !== -1) {

      if (this.i < this.events.length - 1) {
        this.i++

        this.playing = true
        await this.hm.resolve_animation_end

        if (!this.playing) {
          return
        }
        this.play_loop()
      } else {
        this.i = -1
      }
    }
  }

  constructor() {

    createEffect(on(this._i[0], (i, pre) => {
      const events = this.events[i === -1 ? this.events.length -1 : i]
      if (!events) {
        return
      }
      console.log(events.round_pov?.fen)
      if (pre !== undefined && i === pre + 1) {
        // patch events
        if (events.round_events) {
          this.hm.round_patch(events.round_events)
        }

        if (!events.round_pov) {
          this.hm.round_init(undefined)
        } else {
          if (!this.hm.is_round_initialized) {
            this.hm.round_init(events.round_pov)
          }
        }

      } else {
        if (events.round_pov) {
          this.hm.round_init(events.round_pov)
        } 
        if (events.game_pov) {
          this.hm.game_init(events.game_pov)
        }
      }
    }))
  }

}


class PokerPlayDebug {

  replay: HeadsupReplay = new HeadsupReplay()
  hh: Headsup

  headsup_change: Signal<undefined> = createSignal(undefined, { equals: false })

  constructor(_fen?: string) {
    this.hh = Headsup.make()

    let hh_round_dests = createMemo(() => {
      this.headsup_change[0]()
      return this.hh.round_dests
    })

    let hh_round = createMemo(() => {
      this.headsup_change[0]() 
      return this.hh.round
    })

    let hh_game = createMemo(() => {
      this.headsup_change[0]() 
      return this.hh.game
    })

    createEffect(on(hh_round, (round, pre) => { 
      if (!pre && round) {
        this.ui.hm.round_init(round.pov(1))
      } else if (pre && !round) {
        this.ui.hm.round_init(undefined)
      }
     }))

    createEffect(on(hh_game, (game, pre) => { 
      if (!pre && game) {
        this.ui.hm.game_init(game)
      } else if (pre && !game) {
        this.ui.hm.game_init(undefined)
      }
     }))

     createEffect(on(hh_round_dests, dests => {
        if (this.hh.round?.action_side === 1) {
         this.ui.hm._dests[1](dests)
        } else {
          this.ui.hm._dests[1](undefined)
        }
     }))
  }



  get ui() {
    return this.players[0] as UIPlayer
  }

  players: [Player, Player] = [new UIPlayer(), new AIPlayer()]
  level = 1

  async phase_loop() {
    let h = this.hh
    let players = this.players

    const dealer_act_for_round = (act: string) => {
      let events = h.round_act(act)
      players[0].round_events(events.pov(1) ?? [])
      this.replay.round_events(events, h.round, h.game)
      this.headsup_change[1]()
    }

    while (!h.winner) {

      await (players[0] as UIPlayer).hm.resolve_animation_end

      if (h.game_dests.deal) {
        let { small_blind, button, seats } = h.game!
        if (++this.level % 20 === 0) {
          let new_blinds = small_blind + 20
          h.game = new GameN(new_blinds, button, seats)
        }

        let game_events = h.game_act('deal')

        this.headsup_change[1]()
        players[0].game_events(game_events?.pov(1) ?? [])
        if (game_events) {
          this.replay.game_events(game_events, h.round, h.game)
        }

        let events = h.round_act(`deal ${make_deal(2)}`)

        players[0].round_events(events.pov(1) ?? [])
        this.replay.round_events(events, h.round, h.game)
        this.headsup_change[1]()
      }

      const { round, round_dests } = h

      if (round && round_dests) {
        if (round_dests.phase) {
          dealer_act_for_round('phase')
        } else if (round_dests.win) {
          dealer_act_for_round('win')
        } else if (round_dests.share) {
          dealer_act_for_round('share')
        } else if (round_dests.showdown) {
          dealer_act_for_round('showdown')
        } else {

          let { action_side } = round

          let op_side = action_side === 1 ? 2 : 1 as Side

          let action = await players[action_side - 1].act(round.pov(action_side), round_dests)

          players[op_side - 1].opponent_act(round.pov(op_side), action)

          let events = h.round_act(action)
          players[0].round_events(events.pov(1) ?? [])
          this.replay.round_events(events, h.round, h.game)
          this.headsup_change[1]()
        }
      }
    }
    console.log(h.winner)
  }
}

export const Poker2 = () => {

  let dd = new PokerPlayDebug()
  const hm = createMemo(on(() => dd.replay.i, i => {
    if (i === -1) {
      return (dd.players[0] as UIPlayer).hm
    } else {
      return dd.replay.hm
    }
  }))

  const dests = createMemo(() => hm().dests())
  const flop = createMemo(() => hm().flop())
  const turn = createMemo(() => hm().turn())
  const river = createMemo(() => hm().river())
  const pot = createMemo(() => hm().pot())
  const stacks = createMemo(() => hm().stacks())
  const seats = createMemo(() => hm().seats())
  const pot_shares = createMemo(() => hm().pot_shares())

  let raise_ui = createMemo(() => {
    let d = dests()
    if (!d) {
      return undefined
    }

    let stack = stacks()?.[0]
    let _pot = pot()

    let raise = d.raise
    if (stack && raise) {
      return new RaiseUI(raise, stack, _pot?.total_pot ?? 0)
    }
  })

  dd.phase_loop()

  let klass = ['one', 'two']

  const on_send_action = (cmd: string) => {
    dd.players[0].send_action(cmd)
  }

  let replay_list_ref: HTMLUListElement


  createEffect(() => {
    // tracking
    dd.replay.i
    dd.replay.events

    const cont = replay_list_ref.parentElement
    if (!cont) {
      return
    }

    const target = replay_list_ref.querySelector<HTMLElement>('li.active')

    if (!target) {
      cont.scrollTop = 99999
      return
    }
    let top = target.offsetTop - cont.offsetHeight / 2 + target.offsetHeight
    cont.scrollTo({ behavior: 'smooth', top})
  })

  return (<>

    <div class='poker2'>
      <div class='table'>
        <div class='bg'></div>
        <div class='logo'><span>li</span>HeadsUp</div>
        <div class='circle'></div>

        <div class='replay'>
          <div class='list'>
          <ul ref={_ => replay_list_ref = _}>
            <For each={dd.replay.events}>{(event, i) => 
               <li onClick={() => dd.replay.go_to_i(i())} class={dd.replay.i === -1 ? (i() === dd.replay.events.length - 1 ? 'active' : '') : (i() === dd.replay.i ? 'active': '')}>
                  {(event.round_events??event.game_events)?.map(_ => _.fen)}
               </li>
            }</For>
          </ul>
          </div>
          <div class='buttons'>
            <button onClick={() => dd.replay.go_back()}>{'<'} Back</button>
            <button onClick={() => dd.replay.go_forward()}>Forward {'>'} </button>
            <button onClick={() => dd.replay.play_loop()}>Play </button>
          </div>
        </div>


        <div class='showdown-win'>
          <Show when={pot_shares()}>{ info => 
            <> <span></span> </>
          }</Show>
        </div>
        <div class='middle'>
          <Show fallback={
            <>
              <div class='flop1'></div>
              <div class='flop2'></div>
              <div class='flop3'></div>
            </>
          } when={flop()}>{flop =>
            <>
              <div class='flop1'><div class={flop()[0].klass}></div></div>
              <div class='flop2'><div class={flop()[1].klass}></div></div>
              <div class='flop3'><div class={flop()[2].klass}></div></div>
            </>
            }</Show>
          <div class='turn'><Show when={turn()}>{turn => <div class={turn().klass}></div>}</Show></div>
          <div class='river'><Show when={river()}>{river => <div class={river().klass}></div>}</Show></div>
        </div>
        <div class='totalpot'>
          <Show when={pot()}>{pot =>
            <>
              <span>Total Pot:</span>
              <span class='chips'>{pot().total_pot}<span>li</span></span>
            </>
          }</Show>
        </div>


        <Show when={dests()}>{dests =>
          <>
            <div class='bet-ui'>
              <Show when={raise_ui()}>{raise_ui =>
                <div class='raise-ui'>
                  <div class='slider-ui'>
                    <input type='range' min={raise_ui().raise.min_raise ?? raise_ui().allin} max={raise_ui().allin} value={raise_ui().current} class='slider' onChange={(e) => raise_ui().current = parseInt(e.target.value) } onInput={(e) => raise_ui().current = parseInt(e.target.value)}></input>
                    <span class='chips'>{Math.ceil(raise_ui().current)}<span>li</span></span>
                  </div>
                  <div class='pre-raises'>
                    <Show when={raise_ui().threebet}>{threebet =>
                      <button onClick={() => raise_ui().on_current(threebet())} class='raise one'>3 Bet</button>
                    }</Show>
                    <Show when={raise_ui().fivebet}>{fivebet =>
                      <button onClick={() => raise_ui().on_current(fivebet())} class='raise two'>5 Bet</button>
                    }</Show>
                    <Show when={raise_ui().min_raise}>{min_raise =>
                      <button onClick={() => raise_ui().on_current(min_raise())} class='raise one'>Min Raise</button>
                    }</Show>
                    <Show when={raise_ui().third_raise}>{third_raise =>
                      <button onClick={() => raise_ui().on_current(third_raise())} class='raise two'>x3 Raise</button>
                    }</Show>
                    <Show when={raise_ui().five_raise}>{five_raise =>
                      <button onClick={() => raise_ui().on_current(five_raise())} class='raise three'>x5 Raise</button>
                    }</Show>
                    <Show when={raise_ui().potraise}>{pot =>
                      <button onClick={() => raise_ui().on_current(pot())} class='raise four'>Pot</button>
                    }</Show>
                    <Show when={raise_ui().allin}>{allin =>
                      <button onClick={() => raise_ui().on_current(allin())} class='raise five'>All-in</button>
                    }</Show>
                  </div>
                </div>
              }</Show>
              <div class='action-ui'>
                <Show when={dests()?.fold}>
                  <button onClick={() => on_send_action('fold')} class='fold'>Fold</button>
                </Show>
                <Show when={dests()?.check}>
                  <button onClick={() => on_send_action('check')} class='check'>Check</button>
                </Show>
                <Show when={dests()?.call}>{call =>
                  <button onClick={() => on_send_action('call ' + call().match)} class='call'>Call <span class='chips'>{call().match} <span>li</span></span></button>
                }</Show>
                <Show when={raise_ui()}>{raise_ui =>
                  <button onClick={() => on_send_action(raise_ui().on_send_action)} class='raise'>Raise to <span class='chips'>{raise_ui().raise_to} <span>li</span></span></button>
                }</Show>
              </div>

            </div>
          </>
        }</Show>
        <Index fallback={
           <Index each={seats()}>{ (seat, i) =>
            <>
              <div class={'avatar ' + klass[i]}>
                <div class={'betdesc ' + klass[i]}></div>
                <span class='chips'>{seat().chips}<span>li</span></span>
                <div class='turn-timer off'></div>
                <div class={'hand ' + klass[i]}></div>
              </div>
            </>
           }</Index>
        }
        each={stacks()}>{(stack, i) =>
          <>
            <div class={'avatar ' + klass[i] + (stack().state[0]() === '@' ? ' turn' : '')}>
              <div class={'betdesc ' + klass[i] + (stack().bet[0]() ? ' on' : '')}>
              <Show when={stack().bet[0]()}>{bet =>
                <>
                    <Show fallback={
                      <span class={`desc ${bet().desc}`}>{bet().desc}</span>
                    } when={bet().raise}>{raise =>
                      <>
                        <span class={`desc ${bet().desc}`}>{bet().desc}</span>
                        <span class='chips raise'>{raise()}<span>li</span></span>
                      </>
                      }</Show>
                </>
              }</Show>
              </div>
              <Show fallback={
                <div class='turn-timer off'></div>
              } when={stack().state[0]() === '@'}>
                <div class='turn-timer'><div class='bar' style={`width: 50%`}></div></div>
              </Show>


              <span class='chips'>{stack().stack[0]()}<span>li</span></span>
              <Show fallback={
                <div class={'hand ' + klass[i]}>
                  <div class={'card back'}></div>
                  <div class={'card back'}></div>
                </div>
              } when={stack().hand}>{hand =>
                <div class={'hand ' + klass[i]}>
                  <div class={hand()[0].klass}></div>
                  <div class={hand()[1].klass}></div>
                </div>
                }</Show>
            </div>
            <Show when={stack().bet[0]()}>{bet =>
              <>
                <div class={'betprevious ' + klass[i]}>
                  <Show when={bet().total > 0}>
                    <span class='chips previous'>{bet().total}<span>li</span></span>
                  </Show>
                </div>
              </>
            }</Show>

          </>
        }</Index>
      </div>
    </div>

  </>)
}