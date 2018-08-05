+++
date = "2018-08-03T11:18:00+08:00"
title = "Publish non project files in Visual Studio One Click Publishing"
tags = ["visual-studio","publishing"]
+++

Add the following to your projects PublishProfiles .pubxml config before the closing </Project> element. This is useful on occasions when you need to deploy for example Angular build files to a server outside of a CI environment. 

**CustomFile Include="{path}"** is the path to your non project files in your project. 
**DestinationRelativePath** needs to contain **'%(RecursiveDir)%(Filename)%(Extension)'** which is the root of the publishing target path. Preface with your CustomFile Include path to target the same directory structure under the deployment target root e.g **Scripts\Angular\Release\%(RecursiveDir)%(Filename)%(Extension)**

{{< highlight xml >}}
<Target Name="CustomCollectFiles">
    <ItemGroup>
        <_CustomFiles Include="Scripts\Angular\Release\**\*" />
        <FilesForPackagingFromProject Include="%(_CustomFiles.Identity)">
        <DestinationRelativePath>Scripts\Angular\Release\%(RecursiveDir)%(Filename)%(Extension)</DestinationRelativePath>
        </FilesForPackagingFromProject>
    </ItemGroup>
</Target>
<PropertyGroup>
    <CopyAllFilesToSingleFolderForPackageDependsOn>
        CustomCollectFiles;
        $(CopyAllFilesToSingleFolderForPackageDependsOn);
    </CopyAllFilesToSingleFolderForPackageDependsOn>

    <CopyAllFilesToSingleFolderForMsdeployDependsOn>
        CustomCollectFiles;
        $(CopyAllFilesToSingleFolderForMsdeployDependsOn);
    </CopyAllFilesToSingleFolderForMsdeployDependsOn>
</PropertyGroup>
{{< /highlight >}}

More info here https://docs.microsoft.com/en-us/aspnet/web-forms/overview/deployment/visual-studio-web-deployment/deploying-extra-files