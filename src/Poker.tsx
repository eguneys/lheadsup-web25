import './Avatar.scss'
import { ActionBetEvent, Bet, ButtonEvent, Card, ChangeState, Chips, CollectHand, CollectPot, Dests, Event, Events, FlopEvent, GameN, get_klass_info, HandEvent, Headsup, make_deal, PotAddBet, PotShare, PotShareEvent, Raise, ranks, RiverEvent, RoundNExtra, RoundNPov, Seat, Side, Stack, StackAddEvent, StackEvent, StackState, suits, TurnEvent } from 'phevaluatorjs25'
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
    return (this.stack.bet?.total ?? 0) + this.raise.match + this.current
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

      this.bet = value.bet

      this.stack[1](value.stack)
      this.state[1](value.state)
      this.hand.map((h, i) => { 
        h.card = value.hand?.[i] 
        if (!value.hand) {
          h._dealt_back[1](true)
        } else {
          h._dealt_back[1](false)
        }
      })
    }

  pot_add_bet() {
    this._t_bet_pot_add[1](0)

    clearInterval(this.clear_timer_pot_add)
    this.clear_timer_pot_add = setInterval(() => {
      let e = this._t_bet_pot_add[0]()!


      if (e > 800) {
        clearInterval(this.clear_timer_pot_add)
        this.clear_timer_pot_add = undefined

        this._t_bet_pot_add[1](undefined)
        this._bet[1](undefined)

      } else {
        this._t_bet_pot_add[1](e + 60)
      }
    }, 60)
  }

  get bet_klass() {
    let res = ''

    if (this.bet) res += ' on'
    if (this.bet_flash) res += ' flash'
    return res
  }

  get bet_previous_klass() {
    let res = ''
    if (this.bet_add_pot) res += ' to-pot'
    return res
  }

  get bet_add_pot() {
    return this._t_bet_pot_add[0]() !== undefined
  }

    get bet_flash() {
      return this._t_bet_flash[0]() < 600
    }

    _t_bet_pot_add = createSignal<number | undefined>(undefined)

    clear_timer_pot_add?: number

    _t_bet_flash = createSignal(0)
    clear_timer?: number

    get bet() {
      return this._bet[0]()
    }

    set bet(value: Bet | undefined) {

      if (!value) {
        if (this._t_bet_pot_add[0]() !== undefined) {
          return
        }
      }


      this._bet[1](value)

      if (!value) {
        return
      }

      this._t_bet_flash[1](0)
      clearInterval(this.clear_timer)
      this.clear_timer = setInterval(() => {
        let e = this._t_bet_flash[0]()


        if (e > 600) {
          clearInterval(this.clear_timer)
          this.clear_timer = undefined
        } else {
          this._t_bet_flash[1](e + 60)
        }
      }, 60)
    }

    _bet: Signal<Bet | undefined> = createSignal<Bet | undefined>(undefined)
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
      if (this._dealt_back[0]()) {
        return 'card back'
      }
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

  _dealt_back: Signal<boolean> = createSignal(false)

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
        this.stacks[ev.side - 1].bet = ev.bet
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
        this.stacks[ev.side - 1].pot_add_bet()
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


  _turn_timer_left = createSignal<number | undefined>(undefined, { equals: false })
  _t_turn_timer_left = createSignal<number | undefined>(undefined)
  clear_timer?: number


  get turn_timer_left() {
    let e = this._t_turn_timer_left[0]()
    if (e === undefined) {
      return undefined
    }
    return e / 13000
  }

  init_extra(extra: RoundNExtra) {
    this._turn_timer_left[1](extra.time_left)
  }


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


    createEffect(on(this._turn_timer_left[0], (left) => {
      if (left === undefined) {
        this._t_turn_timer_left[1](undefined)
        return
      }

      this._t_turn_timer_left[1](13000 - left)

      clearInterval(this.clear_timer)
      this.clear_timer = setInterval(() => {
        let e = this._t_turn_timer_left[0]()!


        if (e >= 13000) {
          clearInterval(this.clear_timer)
          this.clear_timer = undefined

          this._t_turn_timer_left[1](undefined)
        } else {
          this._t_turn_timer_left[1](e += 10)
        }
      }, 10)
    }))


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
  round_init(round_pov: RoundNPov | undefined) {
    this.roundn.init_hydrate(round_pov)
  }

  dests_init(dests?: Dests) {
    this._dests[1](dests === undefined ? true : dests)
  }

  extra_init(extra: RoundNExtra) {
    this.roundn.init_extra(extra)
  }

  get is_round_initialized() {
    return this.roundn.is_initialized
  }

  

  gamen: GameNMemo
  roundn: RoundNPovMemo
  _dests: Signal<Dests | true> = createSignal<Dests | true>(true)

  dests_resource: ResourceReturn<Dests | undefined>

  dests: Accessor<Dests | undefined>

  flop: Accessor<[CardRevealMemo, CardRevealMemo, CardRevealMemo] | undefined>
  turn: Accessor<CardRevealMemo | undefined>
  river: Accessor<CardRevealMemo | undefined>

  stacks: Accessor<StackMemo[] | undefined>
  seats: Accessor<SeatMemo[] | undefined>
  pot: Accessor<PotMemo | undefined>
  pot_shares: Accessor<PotShareInfo[] | undefined>
  turn_timer_left: Accessor<number | undefined>

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
      if (dests === true) {
        return undefined
      }
      await this.resolve_animation_end
      return dests
    })

    this.dests = createMemo(() => {
      if (this.dests_resource[0].loading) {
        return undefined
      }
      let res = this.dests_resource[0]()
      if (res === null) {
        return undefined
      }
      return res
    })

    this.flop = createMemo(() => this.roundn.is_initialized ? this.roundn.flop : undefined)
    this.turn = createMemo(() => this.roundn.is_initialized ? this.roundn.turn : undefined)
    this.river = createMemo(() => this.roundn.is_initialized ? this.roundn.river : undefined)

    this.pot = createMemo(() => this.roundn.is_initialized ? this.roundn.pot : undefined)
    this.pot_shares = createMemo(() => this.roundn.is_initialized ? this.roundn.pot_shares[0]() : undefined)

    this.stacks = createMemo(() => this.roundn.is_initialized ? this.roundn.stacks : undefined)
    this.seats = createMemo(() => this.gamen.is_initialized ? this.gamen.seats : undefined)

    this.turn_timer_left = createMemo(() => this.roundn.is_initialized ? this.roundn.turn_timer_left : undefined)
  }

  round_patch(events: Event[]) {
    this.roundn.patch(events)
  }
}
type RecordEvent = {
  round_dests?: Dests, game_events?: Event[], round_events?: Event[], round_extra?: RoundNExtra, round_pov?: RoundNPov, game_pov?: GameN 
}

class HeadsupReplay {

  push_events(event: RecordEvent) {
    this.events.push(event)
    this._events[1](this.events)
    this._i[1](-1)
  }

  _events: Signal<RecordEvent[]> = createSignal<RecordEvent[]>([], { equals: false })
  _i: Signal<number> = createSignal(-1, { equals: false })

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
        this.playing = true

        this.i++

        await this.hm.resolve_animation_end
        await new Promise(resolve => setTimeout(resolve, 1000))

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

    createEffect(on(this._i[0], (i, _pre) => {
      const events = this.events[i === -1 ? this.events.length -1 : i]
      if (!events) {
        return
      }
      console.log(events.round_pov?.fen)
      if (this.playing || i === -1) {
        // patch events
        if (events.round_events) {
          console.log(events.round_events)
          this.hm.round_patch(events.round_events)
        }

        if (!events.round_pov) {
          this.hm.round_init(undefined)
        } else {
          if (!this.hm.is_round_initialized) {
            this.hm.round_init(events.round_pov)
          }
        }

        this.hm.dests_init(events.round_dests)

      } else {
        if (events.round_pov) {
          this.hm.round_init(events.round_pov)
        } 
        if (events.game_pov) {
          this.hm.game_init(events.game_pov)
        }

        this.hm.dests_init(events.round_dests)
      }
    }))
  }

}

abstract class Player {
  

  act(_npov: RoundNPov, _round_dests: Dests) {
    return new Promise<string>(resolve => {
      this.resolve = resolve
    })
  }

  resolve?: (_: string) => void

  send_action(cmd: string) {
    this.resolve?.(cmd)
    this._on_send_action()
  }

  push_data(res: PokerPlaySocketsData) {
    this._push_data(res)
  }

  _on_send_action() {}
  _push_data(_: PokerPlaySocketsData) {}


  _wait_ready = new Promise<void>(resolve => {
    this._wait_ready_resolve = resolve
  })

  _wait_ready_resolve!: () => void

}


class AIPlayer extends Player {

  constructor() {
    super()
    this._wait_ready_resolve()
  }

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

  sockets: PokerPlaySockets = new PokerPlaySockets()

  _push_data(_: PokerPlaySocketsData): void {
    this.sockets.data = _
  }


  send_action(cmd: string) {
    this.resolve?.(cmd)
  }

}



export class HeadsupLocalPlay {

  players: [Player, Player] = [new UIPlayer(), new AIPlayer()]
  hh: Headsup = Headsup.make()

  level = 1
 
  get ui() {
    return this.players[0] as UIPlayer
  }

  async begin_phase_loop_when_ready() {
    await Promise.all(this.players.map(_ => _._wait_ready))

    console.log('begin')
    let winner = await this.phase_loop()
    console.log('over ', winner)
  }

  async phase_loop() {
    let h = this.hh
    let players = this.players

    const headsup_change = (game_events?: Events, round_events?: Events) => {

        for (let i = 0; i < players.length; i++) {
          let res: PokerPlaySocketsData = {}
          res.round_extra = round_events?.extra
          res.game_pov = h.game?.pov(i + 1 as Side).fen
          res.round_pov = h.round?.pov(i + 1 as Side).fen
          res.game_events = game_events?.pov(i + 1 as Side)?.map(_ => _.fen).join(',')
          res.round_events = round_events?.pov(i + 1 as Side)?.map(_ => _.fen).join(',')

          if (h.round && h.round.action_side === i + 1) {
            res.round_dests = h.round_dests?.fen
          }
          players[i].push_data(res)
        }
    }

    const dealer_act_for_round = (act: string) => {
      let events = h.round_act(act)
      headsup_change(undefined, events)
    }

    while (!h.winner) {

      await this.ui.sockets.replay.hm.resolve_animation_end
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (h.game_dests.deal) {
        let { small_blind, button, seats } = h.game!
        if (++this.level % 20 === 0) {
          let new_blinds = small_blind + 20
          h.game = new GameN(new_blinds, button, seats)
        }

        let game_events = h.game_act('deal')
        headsup_change(game_events)

        let round_events = h.round_act(`deal ${make_deal(2)}`)
        headsup_change(undefined, round_events)
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

          let action = await players[action_side - 1].act(round.pov(action_side), round_dests)

          let events = h.round_act(action)
          headsup_change(undefined, events)
        }
      }
    }
    return h.winner
  }

}


type PokerPlaySocketsData = {
  round_dests?: string,
  game_events?: string,
  round_events?: string,
  round_extra?: RoundNExtra,
  round_pov?: string,
  game_pov?: string
}

class PokerPlaySockets {

  replay: HeadsupReplay = new HeadsupReplay()

  _data: Signal<PokerPlaySocketsData | undefined> = createSignal<PokerPlaySocketsData | undefined>(undefined)

  set data(_: PokerPlaySocketsData) {
    this._data[1](_)
  }

  constructor() {

    createEffect(on(this._data[0], data => {
      if (!data) {
        return
      }

      let { game_events, round_events, round_extra, round_pov, game_pov, round_dests } = data

      let res: RecordEvent = {}

      res.game_events = game_events?.split(',').map((_: string) => Event.from_fen(_)!)
      res.round_events = round_events?.split(',').map((_: string) => Event.from_fen(_)!)
      res.game_pov = game_pov ? GameN.from_fen(game_pov) : undefined
      res.round_pov = round_pov ? RoundNPov.from_fen(round_pov) : undefined
      res.round_extra = round_extra
      res.round_dests = round_dests ? Dests.from_fen(round_dests) : undefined

      this.replay.push_events(res)
    }))
  }

}


export const Poker2 = () => {

  let local = new HeadsupLocalPlay()

  local.begin_phase_loop_when_ready()
  local.ui._wait_ready_resolve()
  let dd = local.ui.sockets
  const replay = dd.replay

  const hm = replay.hm

  const dests = createMemo(() => hm.dests())
  const flop = createMemo(() => hm.flop())
  const turn = createMemo(() => hm.turn())
  const river = createMemo(() => hm.river())
  const pot = createMemo(() => hm.pot())
  const stacks = createMemo(() => hm.stacks())
  const seats = createMemo(() => hm.seats())
  const pot_shares = createMemo(() => hm.pot_shares())
  const turn_timer_left = createMemo(() => hm.turn_timer_left())

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

  let klass = ['one', 'two']

  const on_send_action = (cmd: string) => {
    local.ui.send_action(cmd)
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
            <For each={replay.events}>{(event, i) => 
               <li onClick={() => replay.go_to_i(i())} class={replay.i === -1 ? (i() === replay.events.length - 1 ? 'active' : '') : (i() === dd.replay.i ? 'active': '')}>
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
          <Show when={pot_shares()}>{ _info => 
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
              <div class={'betdesc ' + klass[i] + stack().bet_klass}>
              <Show when={stack().bet}>{bet =>
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
              } when={stack().state[0]() === '@' && turn_timer_left()}>{ timer_left => 
                <div class='turn-timer'><div class='bar' style={`width: ${Math.min(1, 1 - timer_left()) * 100}%`}></div></div>
              }</Show>


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
            <Show when={stack().bet}>{bet =>
              <>
                <div class={'betprevious ' + klass[i] + stack().bet_previous_klass}>
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