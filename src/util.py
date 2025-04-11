# Utility file to perform things in dev.
import os
import re

#############
# Functions #
#############


def getAlternateStylesForSVG(svg_name=None):
    styles = [
        {"name": "black", "color1": "2b2b2b", "color2": "444444"},
        {"name": "cyan", "color1": "00bfbf", "color2": "9acee6"},
        {"name": "blue", "color1": "9acee6", "color2": "BF7E96"},
        {"name": "green", "color1": "619E73", "color2": "B1FFFF"},
        {"name": "purple", "color1": "AF84A3", "color2": "9acee6"},
        {"name": "red", "color1": "d10c0c", "color2": "BF7E96"},
    ]
    svg_background = """<g>
  <title>Layer 1</title>
  <path fill="#bfbf91" opacity="NaN" d="m66.56752,446.04791c0,0 230.98261,-182.80287 232.01977,-184.07982c0.37127,1.27695 232.76231,305.30699 232.39105,304.03006c0.37126,1.27693 -292.58229,28.2163 -292.95357,26.93937c0.37128,1.27693 -147.51393,-48.75333 -147.88522,-50.03026c0.37128,1.27693 -23.57204,-96.85935 -23.57204,-96.85935l0.00001,0z" id="svg_47" stroke="#ffffff"/>
  <path fill="#ffd4aa" stroke-width="2" opacity="NaN" d="m456.25611,173.71695l-204.68185,38.10877l108.43949,41.93513l-63.78794,125.80542l121.19708,167.74053l38.83322,-373.58985z" id="svg_49" stroke="#ffffff" transform="rotate(-40 353.915 360.512)"/>
  <path transform="rotate(50 395.618 37.29)" fill="#c5c5f9" opacity="NaN" d="m134.77548,233.50185l351.21495,-392.844l170.47082,337.37937l-332.69306,55.88493l-188.99271,-0.4203z" id="svg_48" stroke-width="2" stroke="#ffffff"/>
  <path fill="#f9cae1" stroke="#ffffff" stroke-width="2" opacity="NaN" d="m480.64611,579.79963l-108.82042,-306.56408l192.955,-184.50441l35.21077,173.23697l-4.22529,195.77186l-115.12005,122.05967l-0.00001,-0.00001z" id="svg_46"/>
  <path fill="#f9cae1" stroke="#ffffff" stroke-width="2" opacity="NaN" d="m69.38439,106.56696l84.13455,242.72384l-84.50584,209.85616l-66.19624,-139.43463l-1.40843,-250.70065l67.97596,-62.44472z" id="svg_45"/>
  <path fill="none" stroke="#000" stroke-width="5" d="m280.08809,643.92269l0.56913,0l0.17587,-0.54067l0.17587,0.54067l0.56913,0l-0.46044,0.33415l0.17588,0.54067l-0.46044,-0.33416l-0.46044,0.33416l0.17588,-0.54067l-0.46044,-0.33415z" id="svg_30"/>
  <path id="svg_6" d="m-97.57258,98.16746c-0.0841,-0.01521 -0.1131,-0.12145 -0.06296,-0.1851c0.06654,-0.09844 0.20888,-0.1648 0.3204,-0.10269c0.00222,-0.34665 0.00094,-0.69332 0.00128,-1.03999c0.27807,-0.0561 0.55675,-0.10931 0.83493,-0.16492c-0.0006,0.38852 -0.0012,0.77704 -0.00181,1.16556c-0.04358,0.11751 -0.1844,0.199 -0.30701,0.16256c-0.073,-0.02185 -0.0905,-0.11608 -0.04985,-0.17381c0.05566,-0.08612 0.15927,-0.14525 0.26343,-0.12912c0.02972,-0.00301 0.07349,0.04512 0.06093,-0.00932c0,-0.23356 0,-0.46711 0,-0.70067c-0.25526,0.05139 -0.51102,0.10033 -0.7664,0.15116c-0.00114,0.28176 0.00283,0.56362 -0.00294,0.8453c-0.0176,0.09456 -0.11057,0.16004 -0.20029,0.17913c-0.02964,0.00353 -0.06005,0.00659 -0.08971,0.00191l0,0zm0.66587,-1.17572c0.13115,-0.02581 0.26237,-0.05131 0.39346,-0.07741c0.01668,-0.06647 -0.05798,-0.0233 -0.0945,-0.02168c-0.22394,0.04421 -0.448,0.08776 -0.67191,0.13213c-0.01668,0.06647 0.05798,0.0233 0.0945,0.02168c0.0928,-0.01829 0.18562,-0.03652 0.27844,-0.05473l0.00001,0.00001zm0,-0.11633c0.13115,-0.02581 0.26237,-0.05131 0.39346,-0.07741c0.01668,-0.06647 -0.05798,-0.0233 -0.0945,-0.02168c-0.22394,0.04421 -0.448,0.08776 -0.67191,0.13213c-0.01668,0.06647 0.05798,0.0233 0.0945,0.02168c0.0928,-0.01829 0.18562,-0.03652 0.27844,-0.05473l0.00001,0.00001z" stroke="#000" fill="#fff"/>
  <path fill="#000000" stroke="null" opacity="NaN" id="svg_2"/>
  <path fill="#c5f7dd" stroke-width="2" opacity="NaN" d="m-43.29006,86.56725l193.99214,250.04767l254.92594,-225.3489l-243.6585,-90.13956" id="svg_39" stroke="#ffffff"/>
  <path fill="#ffffaa" stroke="#ffffff" stroke-width="2" opacity="NaN" d="m53.89165,478.58041l192.58371,-185.62684l-246.47536,4.22529l53.89165,181.40155z" id="svg_40"/>
  <path fill="#ffd4aa" stroke="#ffffff" stroke-width="2" opacity="NaN" d="m573.60252,152.76347l-135.5806,34.5578l71.82996,38.02763l-42.25292,114.08288l80.28055,152.11051l25.72301,-338.77881l0,-0.00001z" id="svg_41"/>
  <path fill="#c5f7dd" stroke="#ffffff" stroke-width="2" opacity="NaN" d="m79.2434,676.32408l72.86711,-165.06377l232.39105,8.45058l47.88664,111.26602l-66.19624,142.25149l-286.94856,-96.90433l0,0.00001z" id="svg_42"/>
  <path fill="#ffffaa" stroke="#ffffff" stroke-width="2" opacity="NaN" d="m170.79139,36.61491l127.79591,123.94618l135.20934,16.90117l59.15409,-87.3227l26.76018,-66.19624l-348.91952,12.67159z" id="svg_44"/>
  <path fill="#c5c5f9" opacity="NaN" d="m90.51084,405.34203l179.90784,-267.31582l87.3227,229.57419l-170.42011,38.02763l-96.81043,-0.286z" id="svg_37" stroke="#ffffff" stroke-width="2"/>
  <ellipse fill="none" stroke="#ffffff" stroke-width="99" cx="591.20791" cy="10.93452" id="svg_52" rx="55.63301" ry="34.50655"/>
  <ellipse fill="none" cx="299.66277" cy="298.11351" id="svg_51" rx="335.91067" ry="338.02331" stroke-width="99" stroke="#ffffff"/>
 </g>"""

    if svg_name is None:
        print("Path should be ../public")
        svg_name = input("Enter the SVG name:")
    svg_style = svg_name.split("-")[1].split(".")[0]
    svg_base_name = svg_name.split("-")[0]
    print(f"Using {svg_style} as base style to set others from")
    chosen_style = [style for style in styles if style["name"] == svg_style][0]
    styles = [style for style in styles if style["name"] != svg_style]
    with open(f"./public/topics/{svg_name}", "r") as svg:
        svg_format = svg.read()
    for style in styles:
        with open(
            f"./public/topics/{svg_base_name}-{style['name']}.svg", "w+"
        ) as new_svg:
            contents = svg_format.replace(
                chosen_style["color1"], style["color1"]
            ).replace(chosen_style["color2"], style["color2"])
            new_svg.write(contents)
        print(
            f"""{{ name: "{svg_base_name.title()} ({style['name'].title()})", imageLink: "{svg_base_name}-{style['name']}.svg" }},"""
        )
    ellipse_pattern = r'<ellipse[^>]+id="svg_1"[^>]+>'
    svg_with_bg = re.sub(ellipse_pattern, "", svg_format)
    # svg_with_bg = svg_with_bg.replace(chosen_style["color1"], "FFFFFF")
    g_layer1_regex = r"<g>[\s\S]*<title>Layer 1</title>"
    svg_with_bg = re.sub(
        g_layer1_regex, svg_background + "<g><title>Layer 2</title>", svg_with_bg
    )
    with open(f"./public/topics/{svg_base_name}-colorful.svg", "w+") as new_svg:
        new_svg.write(svg_with_bg)
    print(
        f"""{{ name: "{svg_base_name.title()} (Colorful)", imageLink: "{svg_base_name}-colorful.svg" }},"""
    )


def getAlternateStylesForAllSVG():
    svg_dir = "./public/topics/"
    for root, dirs, files in os.walk(svg_dir):
        for file in files:
            if file.endswith(".svg") and "-black" in file:
                getAlternateStylesForSVG(file)


def getDefaultTopics():
    svg_dir = "./public/topics/"
    print("export const DEFAULT_TOPICS = [")
    for root, dirs, files in os.walk(svg_dir):
        for file in files:
            if file.endswith(
                (
                    "-black.svg",
                    "-cyan.svg",
                    "-red.svg",
                    "-blue.svg",
                    "-colorful.svg",
                    "-green.svg",
                    "-purple.svg",
                )
            ):
                color = file.split("-")[1].split(".")[0].title()
                name = file.split("-")[0].title()
                print(f"""{{ name: "{name} ({color})", imageLink: "{file}" }},""")
    print("];")


###########
# Options #
###########

options = [
    {
        "id": 0,
        "name": "Get alternative color styles for an SVG",
        "function": getAlternateStylesForSVG,
    },
    {
        "id": 1,
        "name": "Get alternative color styles for all SVGs in /public based on -black",
        "function": getAlternateStylesForAllSVG,
    },
    {
        "id": 2,
        "name": "Get DEFAULT_TOPICS for all SVGs in /public",
        "function": getDefaultTopics,
    },
]

##################
# User Interface #
##################
print("""Welcome to the ultity file for data tracker!""")
print("-" * 20)
for option in options:
    print(option["id"], "-", option["name"])
print("-" * 20)
choice = input("Enter the number for a selection:")
for option in options:
    if option["id"] == int(choice):
        option["function"]()
