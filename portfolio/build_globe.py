from pathlib import Path
import json
import base64
import argparse
import shutil

parser = argparse.ArgumentParser(description='Build Will Stauffer\'s project atlas.')
parser.add_argument('--output-dir', type=Path)
parser.add_argument('--inline-output', type=Path)
args = parser.parse_args()
source_dir = Path(__file__).resolve().parent
output_dir = (args.output_dir or source_dir / 'dist').resolve()
output_dir.mkdir(parents=True, exist_ok=True)
source = source_dir / 'project-globe.fragment.html'
text = source.read_text()
text = text.replace('__ATLAS_STYLES__', (source_dir / 'atlas.css').read_text())
text = text.replace('__GLOBE_APP__', (source_dir / 'globe-app.js').read_text())
for token, name in [('__D3_LIBRARY__', 'd3.min.js'), ('__TOPOJSON_LIBRARY__', 'topojson.min.js')]:
    text = text.replace(token, (source_dir / name).read_text().replace('</script', '<\\/script'))
world = json.loads((source_dir / 'land.json').read_text())
text = text.replace('__WORLD_GEOMETRY__', json.dumps(world, separators=(',', ':')))
states = json.loads((source_dir / 'us-states.json').read_text())
text = text.replace('__US_GEOMETRY__', json.dumps(states, separators=(',', ':')))
projects = json.loads((source_dir / 'projects.json').read_text())
text = text.replace('__PROJECT_DATA__', json.dumps(projects, ensure_ascii=False, separators=(',', ':')))
definitions = {
    'divestment': ('Portfolio emissions before and after divestment', 'UN pension fund figures comparing annual portfolio emissions and sector contributions before and after divestment.', 'Figures I created for the UN Joint Staff Pension Fund’s 2021 TCFD report. Source: Entelligent / UNJSPF.', 827, 1200),
    'scenarios': ('Two climate futures', 'CO2 emissions and temperature projections under business-as-usual and Paris-aligned climate scenarios.', 'EnROADS climate scenarios used in our climate scenario analysis. Source: Entelligent / Climate Interactive.', 1200, 637),
    'enroads': ('Inside the scenario model', 'EnROADS scenario settings for energy supply, transport, carbon removal, and warming by 2100.', 'EnROADS scenario interface from my existing portfolio. Source: Climate Interactive / MIT Sloan.', 1200, 658),
    'backtest': ('Climate scores, backtested', 'Historical E-Score and T-Risk portfolio backtest compared with the SPDR S&P 500 ETF from 2017 to 2022.', 'Example historical portfolio backtest from my earlier Entelligent work, 2017–2022.', 1084, 1200),
    'rivers_fyi': ('A river forecast in practice', 'rivers.fyi interface showing historical river flow and an LSTM model forecast.', 'Live river flow forecasting from rivers.fyi. Figure from my existing portfolio.', 600, 441),
    'energy-returns': ('Energy prices and company returns', 'Published chart comparing coal, oil, and gas prices with returns for 3M and Volvo, with historical market events marked.', 'Figure 6 from Energy-Climate Transition Risk for Equities, a March 15, 2021 research note by Elliot Cohen. Source: Entelligent Data Science Team. Historical observational relationships between energy prices and company performance.', 900, 512),
}
media = {}
for name, (title, alt, caption, width, height) in definitions.items():
    encoded = base64.b64encode((source_dir / 'media' / (name + '.webp')).read_bytes()).decode()
    media[name] = dict(title=title, alt=alt, caption=caption, width=width, height=height, src='data:image/webp;base64,'+encoded, original=name+'.png')
media['energy-returns']['credit'] = 'Published Entelligent research · 2021'
media['energy-returns']['originalUrl'] = 'https://www.entelligent.com/wp-content/uploads/2021/04/Energy-Climate-Transition-Risk-for-Equities.pdf#page=7'
photos = {
    'nam-ou-river': ('Life on the Nam Ou', 'A longboat carries passengers through a rocky channel of the Nam Ou River in Laos.', 'Photograph by Will Stauffer-Norris, published in National Geographic Adventure, June 2016. Nam Ou River, Laos.', 800, 442, 'https://i.natgeofe.com/n/a6cb57bd-4d1b-4ed1-9894-aa51b363d383/boat-speeding-down-river-nam-ou.jpg'),
    'nam-ou-cycling': ('Cycling past Nam Ou 5', 'Kyle Hemes cycles past workers and construction at the Nam Ou 5 hydropower dam in Laos.', 'Photograph by Will Stauffer-Norris, published in National Geographic Adventure, June 2016. Kyle Hemes at the Nam Ou 5 hydropower project.', 800, 533, 'https://i.natgeofe.com/n/2b35160a-59f5-440e-9df4-17b8b2eb9b9a/kyle-riding-past-damn-workers-nam-ou.jpg'),
}
for name, (title, alt, caption, width, height, original_url) in photos.items():
    encoded = base64.b64encode((source_dir / 'media' / (name + '.webp')).read_bytes()).decode()
    media[name] = dict(title=title, alt=alt, caption=caption, width=width, height=height, src='data:image/webp;base64,'+encoded, original=name+'.jpg', kind='photo', originalUrl=original_url)
text = text.replace('__PROJECT_MEDIA__', json.dumps(media, ensure_ascii=False, separators=(',', ':')))
portrait = base64.b64encode((source_dir / 'media/profile.webp').read_bytes()).decode()
text = text.replace('__PROFILE_MEDIA__', 'data:image/webp;base64,'+portrait)
assert len(text.encode()) < 2_000_000
assert '\u2014' not in text
if args.inline_output:
    args.inline_output.write_text(text)
assets = output_dir / 'assets'
assets.mkdir(exist_ok=True)
for filename in [figure['original'] for figure in media.values()]:
    shutil.copy2(source_dir / 'originals' / filename, assets / filename)
output = output_dir / 'project-globe.html'
document = '''<!doctype html>
<html lang="en" data-portfolio-page="true">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="Will Stauffer: environmental data science and AI for climate, carbon removal, water, and energy."><title>Will Stauffer | Environmental data science &amp; AI</title>
<style>:root{color-scheme:light dark}body{margin:0;padding:24px;background:light-dark(#edece3,#182019)}@media(max-width:620px){body{padding:0}}</style></head><body>'''
output.write_text(document + text + '\n</body></html>')
print('Created self-contained globe:', output.stat().st_size, 'bytes')
