#!/usr/bin/env python3

import shutil
from pathlib import Path

import call_wrapper

def copy_reference_projects():
    cur_dir = Path(__file__).parent.absolute()

    root_dir = cur_dir.parent
    shutil.copy2(cur_dir/"additional_files"/"mozjs.vcxproj", str(root_dir/"mozjs") + '/')

    submodules_dir = root_dir/"submodules"
    shutil.copy2(cur_dir/"additional_files"/"acfu-sdk.vcxproj", str(submodules_dir/"acfu-sdk") + '/')
    shutil.copy2(cur_dir/"additional_files"/"fmt.vcxproj", str(submodules_dir/"fmt") + '/')
    shutil.copy2(cur_dir/"additional_files"/"json.vcxproj", str(submodules_dir/"json") + '/')
    shutil.copy2(cur_dir/"additional_files"/"range.vcxproj", str(submodules_dir/"range") + '/')
    shutil.copy2(cur_dir/"additional_files"/"smp_2003.vcxproj", str(submodules_dir/"smp_2003") + '/')
    shutil.copy2(cur_dir/"additional_files"/"timsort.vcxproj", str(submodules_dir/"timsort") + '/')
    shutil.copy2(cur_dir/"additional_files"/"wtl.vcxproj", str(submodules_dir/"wtl") + '/')


if __name__ == '__main__':
    call_wrapper.final_call_decorator(
        "Setting up vcxitem reference projects",
        "Setting up vcxitem reference projects: success",
        "Setting up vcxitem reference projects: failure!"
    )(configure)()
