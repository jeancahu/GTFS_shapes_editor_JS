#!/usr/bin/env python
# $ pip install twine setuptools wheel

import io
from os import system as bash, path
import sys
from shutil import rmtree
from setuptools import find_packages, setup, Command

# Package meta-data.
VERSION = '0.1.5'

REQUIRED = [
]

EXTRAS = {
}

here = path.abspath(path.dirname(__file__))

# Import the README and use it as the long-description.
# Note: this will only work if 'README.md' is present in your MANIFEST.in file!
try:
    with io.open(path.join(here, 'README.md'), encoding='utf-8') as f:
        long_description = '\n' + f.read()
except FileNotFoundError:
    long_description = DESCRIPTION

# Load the package's __version__.py module as a dictionary.
about = {}
if not VERSION:
    project_slug = NAME.lower().replace("-", "_").replace(" ", "_")
    with open(path.join(here, project_slug, '__version__.py')) as f:
        exec(f.read(), about)
else:
    about['__version__'] = VERSION


class UploadCommand(Command):
    """Support setup.py upload."""

    description = 'Build and publish the package.'
    user_options = []

    @staticmethod
    def status(s):
        """Prints things in bold."""
        print('\033[1m{0}\033[0m'.format(s))

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        try:
            self.status('Removing previous builds…')
            rmtree(path.join(here, 'dist'))
        except OSError:
            pass

        self.status('Building Source and Wheel (universal) distribution…')
        bash('echo {0} setup.py sdist bdist_wheel --universal'.format(sys.executable))

        self.status('Uploading the package to PyPI via Twine…')
        bash('echo twine upload dist/*')

        self.status('Pushing git tags…')
        bash('echo git tag v{0}'.format(about['__version__']))
        bash('echo git push --tags')

        sys.exit()

class BuildCommand(Command):
    """Support setup.py upload."""

    description = 'Build and publish the package.'
    user_options = []

    @staticmethod
    def status(s):
        """Prints things in bold."""
        print('\033[1m{0}\033[0m'.format(s))

    def initialize_options(self):
        pass

    def finalize_options(self):
        pass

    def run(self):
        try:
            self.status('Removing previous builds…')
            rmtree(path.join(here, 'build'))
            rmtree(path.join(here, 'dist'))
        except OSError:
            pass

        print("Run npm run dist first for production version")

        self.status('Building Source and Wheel (universal) distribution…')
        bash('npm run dist && {0} setup.py sdist bdist_wheel --universal'.format(sys.executable))

        sys.exit()

setup(
    name='shapeeditor',
    version=about['__version__'],
    description='GTFS Editor frontend app for Django',
    long_description=long_description,
    long_description_content_type='text/markdown',
    author='Jeancarlo Hidalgo',
    author_email='jeancahu@gmail.com',
    python_requires='>=3.7.0',
    url='https://github.com/jeancahu/GTFS_shapes_editor_JS',
    package_dir={"": "src"},
    packages=find_packages(where="src", exclude=["tests", "*.tests", "*.tests.*", "tests.*"]),
    # entry_points={
    #     'console_scripts': ['mycli=mymodule:cli'],
    # },
    install_requires=REQUIRED,
    extras_require=EXTRAS,
    include_package_data=True,
    license='MIT',
    classifiers=[
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: Implementation :: CPython',
        'Programming Language :: Python :: Implementation :: PyPy'
    ],
    cmdclass={
        'upload': UploadCommand,
        'dist': BuildCommand
    },
)
