import { For } from 'solid-js/web'
import './Avatar.scss'
import { Bet, Card, Chips, Dests, GameN, Headsup, make_deal, Raise, ranks, RoundNPov, Side, Stack, StackState, suits } from 'phevaluatorjs25'
import { Accessor, createEffect, createMemo, createSignal, mapArray, Show, Signal } from 'solid-js'

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
      console.log(this.raise.min_raise, bet)
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
    return this.stack.stack - this.raise.match
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

  constructor(readonly raise: Raise, readonly stack: Stack, readonly pot: Chips) {
    this._current = createSignal(raise.min_raise === 0 ? raise.match : raise.min_raise)
  }


}

const card_klass = (card: Card) => {

  const suit_klasses = ['clubs', 'hearts', 'diamonds', 'spades']
  const rank_klasses = ['two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'jack', 'queen', 'king', 'ace']

  let rank = rank_klasses[ranks.indexOf(card[0])]
  let suit = suit_klasses[suits.indexOf(card[1])]

  return `card ${suit} ${rank}`
}

class StackMemo {
    bet: Accessor<Bet | undefined>
    stack: Accessor<number>
    state: Accessor<StackState>
    hand: Accessor<[Card, Card] | undefined>

    constructor(readonly value: Stack) { 
        this.stack = createMemo(() => value.stack)
        this.state = createMemo(() => value.state)
        this.bet = createMemo(() => value.bet)
        this.hand = createMemo(() => value.hand)
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

}

class AIPlayer extends Player {

  async act(npov: RoundNPov, dests: Dests) {
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

}


class PokerPlayDebug {

  hh: Headsup

  get watch_changes() {
    return this.on_change[0]()
  }

  trigger_change() {
    this.on_change[1](undefined)
  }

  on_change: Signal<undefined>

  dests: Accessor<Dests | undefined>

  constructor(_fen?: string) {

    this.hh = Headsup.make()

    this.on_change = createSignal(undefined, { equals: false })

    this.dests = createMemo(() => {
      this.watch_changes 
      return this.hh.round_dests
    })

    this.phase_loop()

  }

  players: [Player, Player] = [new UIPlayer(), new AIPlayer()]
  level = 1

  async phase_loop() {
    let h = this.hh
    let players = this.players

    const dealer_act_for_round = (act: string) => {
      h.round_act(act)
      this.trigger_change()
    }

    while (!h.winner) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (h.game_dests.deal) {
        let { small_blind, button, seats } = h.game!
        if (++this.level % 20 === 0) {

          let new_blinds = small_blind + 20
          h.game = new GameN(new_blinds, button, seats)
        }

        h.game_act('deal')
        h.round_act(`deal ${make_deal(2)}`)
        this.trigger_change()
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

          h.round_act(action)
          this.trigger_change()
        }
      }
    }
    console.log(h.winner)
  }


  get dests_fen() {
    this.watch_changes
    if (this.hh.round?.action_side === 1) {
      return this.dests()?.fen
    }
  }

  get fen() {
    this.watch_changes
    return this.hh.round?.pov(1).fen
  }
  
}

export const Poker2 = () => {

  let dd = new PokerPlayDebug()

  let fen = createMemo(() => dd.fen)

  createEffect(() => console.log(fen()))

  let dests_fen = createMemo(() => dd.dests_fen)

  let dests = createMemo(() => dests_fen() ? Dests.from_fen(dests_fen()!): undefined)


  let npov = createMemo(() => { 
    let f = fen()
    if (!f) { return undefined } 
    return RoundNPov.from_fen(f)
  })
  let stacks = createMemo(mapArray(() => npov()?.stacks, _ => new StackMemo(_)))
  let flop = createMemo(() => npov()?.flop)
  let turn = createMemo(() => npov()?.turn)
  let river = createMemo(() => npov()?.river)
  let pot = createMemo(() => npov()?.pot)

  let raise_ui = createMemo(() => {
    let d = dests()
    if (!d) {
      return undefined
    }
    let raise = d.raise
    if (raise) {
      return new RaiseUI(raise, stacks()[0].value, pot()?.total_pot ?? 0)
    }
  })

  let klass = ['one', 'two']

  const on_send_action = (cmd: string) => {
    dd.players[0].send_action(cmd)
  }

  return (<>

    <div class='poker2'>
      <div class='table'>
        <div class='bg'></div>
        <div class='logo'><span>li</span>HeadsUp</div>
        <div class='circle'></div>
        <div class='middle'>
          <Show fallback={
            <>
              <div class='flop1'></div>
              <div class='flop2'></div>
              <div class='flop3'></div>
            </>
          } when={flop()}>{flop =>
            <>
              <div class='flop1'><div class={card_klass(flop()[0])}></div></div>
              <div class='flop2'><div class={card_klass(flop()[1])}></div></div>
              <div class='flop3'><div class={card_klass(flop()[2])}></div></div>
            </>
            }</Show>
          <div class='turn'><Show when={turn()}>{turn => <div class={card_klass(turn())}></div>}</Show></div>
          <div class='river'><Show when={river()}>{river => <div class={card_klass(river())}></div>}</Show></div>
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
                    <Show when={raise_ui().potraise}>{pot =>
                      <button onClick={() => raise_ui().on_current(pot())} class='raise three'>Pot</button>
                    }</Show>
                    <Show when={raise_ui().allin}>{allin =>
                      <button onClick={() => raise_ui().on_current(allin())} class='raise four'>All-in</button>
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
        <For each={stacks()}>{(stack, i) =>
          <>
            <div class={'avatar ' + klass[i()] + (stack.state() === '@' ? ' turn' : '')}>
              <Show when={stack.state() === '@'}>
                <div class='turn-timer'><div class='bar' style={`width: 50%`}></div></div>
              </Show>
              <Show when={stack.bet()}>{bet =>
                <>
                  <div class={'betdesc ' + klass[i()]}>
                    <Show fallback={
                      <span class={`desc ${bet().desc}`}>{bet().desc}</span>
                    } when={bet().raise}>{raise =>
                      <>
                        <span class={`desc ${bet().desc}`}>{bet().desc}</span>
                        <span class='chips raise'>{raise()}<span>li</span></span>
                      </>
                      }</Show>
                  </div>
                </>
              }</Show>
              <span class='chips'>{stack.stack()}<span>li</span></span>
              <Show fallback={
                <div class={'hand ' + klass[i()]}>
                  <div class={'card back'}></div>
                  <div class={'card back'}></div>
                </div>
              } when={stack.hand()}>{hand =>
                <div class={'hand ' + klass[i()]}>
                  <div class={card_klass(hand()[0])}></div>
                  <div class={card_klass(hand()[1])}></div>
                </div>
                }</Show>
            </div>
            <Show when={stack.bet()}>{bet =>
              <>
                <div class={'betprevious ' + klass[i()]}>
                  <Show when={bet().total > 0}>
                    <span class='chips previous'>{bet().total}<span>li</span></span>
                  </Show>
                </div>
              </>
            }</Show>

          </>
        }</For>
      </div>
    </div>

  </>)
}