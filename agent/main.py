import asyncio
import websockets
import json
from cnc.command_factory import CommandFactory
from multiprocessing import freeze_support

async def handle_command(ws):
    command = CommandFactory().deserialize(json.loads(await ws.recv()))

    command_answer = await command.execute(None)
    await ws.send(json.dumps(command_answer.serialize()))


async def agent():
    async with websockets.connect('ws://localhost:8000/agent?access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE1NjM2MzQyOTd9.WQNFdKbpGJcXc33laRCMCsgnVJaVwoR6hBBQ48ocQ_I') as ws:
        print('Agent ID:', json.loads(await ws.recv())['agentId'])

        while True:
            await handle_command(ws)

if __name__ == '__main__':
    freeze_support()
    asyncio.get_event_loop().run_until_complete(agent())