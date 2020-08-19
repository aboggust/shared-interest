from setuptools import setup, find_packages

requires = ['lime', 'PIL', 'numpy', 'torch', 'torchvision', 'tqdm']

setup(
    name="SaliencyIOU",
    description="",
    package_dir={"":"backend"},
    packages=find_packages("backend"),
    license="Apache",
    author="Ben Hoover",
    include_package_data=True,
    install_requires=requires
)
